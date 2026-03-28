import { useEffect, useState, useRef } from 'react';

declare global {
  interface Window {
    V86: any;
  }
}

const V86_BASE = '/v86';

interface V86TerminalProps {
  onFallback?: () => void;
}

export function V86Terminal({ onFallback }: V86TerminalProps) {
  const screenRef = useRef<HTMLDivElement>(null);
  const emulatorRef = useRef<any>(null);
  const [status, setStatus] = useState<'loading' | 'booting' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        if (!window.V86) {
          setStatus('loading');
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `${V86_BASE}/libv86.js`;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () =>
              reject(new Error('Could not load libv86.js. Make sure the v86 files are in public/v86/'));
            document.head.appendChild(script);
          });
        }

        if (cancelled || !screenRef.current || !window.V86) return;

        setStatus('booting');
        const emulator = new window.V86({
          wasm_path: `${V86_BASE}/v86.wasm`,
          memory_size: 64 * 1024 * 1024,
          vga_memory_size: 2 * 1024 * 1024,
          screen_container: screenRef.current,
          bios: { url: `${V86_BASE}/seabios.bin` },
          vga_bios: { url: `${V86_BASE}/vgabios.bin` },
          cdrom: { url: `${V86_BASE}/linux.iso` },
          autostart: true,
          disable_keyboard: false,
          disable_mouse: true,
        });

        emulatorRef.current = emulator;

        emulator.add_listener('emulator-ready', () => {
          if (!cancelled) setStatus('ready');
        });

        emulator.add_listener('download-error', (e: any) => {
          if (!cancelled) {
            setStatus('error');
            setErrorMsg(`Failed to download: ${e.url || 'unknown resource'}`);
          }
        });
      } catch (err: any) {
        if (!cancelled) {
          console.error('v86 init error:', err);
          setStatus('error');
          setErrorMsg(err?.message || 'Unknown error');
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      if (emulatorRef.current) {
        try { emulatorRef.current.destroy(); } catch {}
        emulatorRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (status === 'ready' && screenRef.current) {
      const canvas = screenRef.current.querySelector('canvas');
      if (canvas) canvas.focus();
    }
  }, [status]);

  const handleClick = () => {
    if (screenRef.current) {
      const canvas = screenRef.current.querySelector('canvas');
      if (canvas) canvas.focus();
    }
  };

  return (
    <div className="w-full h-full relative" onClick={handleClick}>
      {status !== 'ready' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0a0a0a] px-8">
          {status === 'error' ? (
            <>
              <div className="text-red-400 text-xl font-mono mb-3">
                ✗ Failed to load Linux VM
              </div>
              <div className="text-red-400/60 text-sm font-mono mb-4 text-center max-w-lg leading-relaxed">
                {errorMsg}
              </div>
              <div className="terminal-text text-sm font-mono mb-6 text-center max-w-lg leading-relaxed opacity-70">
                Make sure these files exist in <span className="text-[#fff]">public/v86/</span> :
              </div>
              <div className="font-mono text-sm mb-6 space-y-1">
                <div className="terminal-text opacity-80">├── libv86.js</div>
                <div className="terminal-text opacity-80">├── v86.wasm</div>
                <div className="terminal-text opacity-80">├── seabios.bin</div>
                <div className="terminal-text opacity-80">├── vgabios.bin</div>
                <div className="terminal-text opacity-80">└── linux.iso</div>
              </div>
              {onFallback && (
                <button
                  onClick={onFallback}
                  className="terminal-text text-lg font-mono px-6 py-2 border border-[#33ff00]/50 rounded hover:bg-[#33ff00]/10 transition-colors"
                >
                  → Use simulated terminal instead
                </button>
              )}
            </>
          ) : (
            <>
              <div className="terminal-text text-xl font-mono mb-4">
                {status === 'loading' ? 'Loading x86 emulator...' : 'Booting Linux kernel...'}
              </div>
              <div className="flex gap-1 mt-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: 'var(--terminal-green)',
                      boxShadow: '0 0 6px var(--terminal-glow)',
                      animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
              {status === 'booting' && (
                <div className="terminal-text text-sm font-mono mt-6 opacity-50">
                  Click anywhere to interact once booted
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div
        ref={screenRef}
        className="v86-screen-wrapper"
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      />
    </div>
  );
}
