import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BootSequenceProps {
  onComplete: () => void;
}

const BOOT_MESSAGES = [
  { text: 'BIOS v2.1.0 - Retro Systems Inc.', delay: 100 },
  { text: 'CPU: Virtual x86_64 @ 3.40GHz', delay: 50 },
  { text: 'Memory Test: 2048MB OK', delay: 150 },
  { text: 'Detecting Primary Master... OK', delay: 100 },
  { text: '', delay: 200 },
  { text: 'GRUB Loading...', delay: 300 },
  { text: '', delay: 100 },
  { text: '[    0.000000] Linux version 5.15.0-retro (root@builder) (gcc version 11.2.0)', delay: 50 },
  { text: '[    0.000000] Command line: BOOT_IMAGE=/boot/vmlinuz-5.15.0-retro root=/dev/sda1', delay: 50 },
  { text: '[    0.123456] Kernel command line: BOOT_IMAGE=/boot/vmlinuz-5.15.0-retro', delay: 50 },
  { text: '[    0.234567] Memory: 2048MB available', delay: 50 },
  { text: '[    0.345678] CPU: Virtual CPU detected', delay: 50 },
  { text: '[    0.456789] Calibrating delay loop... done.', delay: 100 },
  { text: '[    0.567890] Mount-cache hash table entries: 2048', delay: 50 },
  { text: '[    0.678901] Checking for hardware changes...', delay: 80 },
  { text: '[    0.789012] PCI: Probing PCI hardware', delay: 50 },
  { text: '[    0.890123] NET: Registered protocol family 2', delay: 50 },
  { text: '[    1.001234] Initializing cgroup subsys', delay: 50 },
  { text: '[    1.112345] EXT4-fs: mounted filesystem with ordered data mode', delay: 80 },
  { text: '[    1.223456] VFS: Mounted root (ext4 filesystem) readonly', delay: 50 },
  { text: '[    1.334567] Freeing unused kernel memory: 512K', delay: 100 },
  { text: '[    1.445678] systemd[1]: systemd 247 running in system mode', delay: 50 },
  { text: '[    1.556789] systemd[1]: Detected architecture x86-64', delay: 50 },
  { text: '', delay: 150 },
  { text: '[  OK  ] Started System Logging Service', delay: 80 },
  { text: '[  OK  ] Started Network Manager', delay: 80 },
  { text: '[  OK  ] Reached target Network', delay: 80 },
  { text: '[  OK  ] Reached target Multi-User System', delay: 80 },
  { text: '', delay: 200 },
  { text: 'Retro Linux 1.0 linux-terminal tty1', delay: 100 },
  { text: '', delay: 50 },
  { text: 'linux-terminal login: user', delay: 300 },
  { text: 'Password: ', delay: 100 },
  { text: 'Last login: Mon Jan 15 10:23:45 2024', delay: 200 },
  { text: '', delay: 100 },
  { text: 'Welcome to Retro Linux!', delay: 100 },
  { text: '', delay: 300 },
];

export function BootSequence({ onComplete }: BootSequenceProps) {
  const [messages, setMessages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [skipped, setSkipped] = useState(false);

  useEffect(() => {
    if (skipped) {
      onComplete();
      return;
    }
    if (currentIndex >= BOOT_MESSAGES.length) {
      setTimeout(onComplete, 500);
      return;
    }
    const message = BOOT_MESSAGES[currentIndex];
    const timer = setTimeout(() => {
      setMessages((prev) => [...prev, message.text]);
      setCurrentIndex((prev) => prev + 1);
    }, message.delay);
    return () => clearTimeout(timer);
  }, [currentIndex, onComplete, skipped]);

  useEffect(() => {
    const handleSkip = () => {
      if (!skipped) {
        setSkipped(true);
      }
    };
    window.addEventListener('keydown', handleSkip);
    window.addEventListener('click', handleSkip);
    return () => {
      window.removeEventListener('keydown', handleSkip);
      window.removeEventListener('click', handleSkip);
    };
  }, [skipped]);

  return (
    <div className="w-full h-full overflow-auto terminal-scroll p-8">
      <AnimatePresence>
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.05 }}
            className="terminal-text text-lg leading-relaxed font-mono whitespace-pre-wrap"
          >
            {msg}
          </motion.div>
        ))}
      </AnimatePresence>
      {!skipped && currentIndex < BOOT_MESSAGES.length && (
        <div className="terminal-text text-sm mt-8 opacity-50">
          Press any key or click to skip...
        </div>
      )}
    </div>
  );
}
