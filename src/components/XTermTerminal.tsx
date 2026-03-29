import { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { executeCommand } from '../utils/commands';

export function XTermTerminal() {
  const termRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const currentPathRef = useRef('/home/user');
  const commandHistoryRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const currentLineRef = useRef('');
  const [, setCurrentPath] = useState('/home/user');

  const updatePath = (p: string) => {
    currentPathRef.current = p;
    setCurrentPath(p);
  };

  useEffect(() => {
    if (!termRef.current) return;

    const term = new Terminal({
      theme: {
        background: '#0a0a0a',
        foreground: '#33ff00',
        cursor: '#33ff00',
        cursorAccent: '#0a0a0a',
        selectionBackground: '#33ff0044',
        selectionForeground: '#33ff00',
        black: '#0a0a0a',
        red: '#ff4444',
        green: '#33ff00',
        yellow: '#ffcc00',
        blue: '#33ff00',
        magenta: '#33ff00',
        cyan: '#33ff00',
        white: '#33ff00',
        brightBlack: '#1a3a1a',
        brightRed: '#ff6666',
        brightGreen: '#66ff33',
        brightYellow: '#ffdd44',
        brightBlue: '#66ff33',
        brightMagenta: '#66ff33',
        brightCyan: '#66ff33',
        brightWhite: '#66ff33',
      },
      fontFamily: "'VT323', monospace",
      fontSize: 20,
      lineHeight: 1.2,
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 1000,
      disableStdin: false,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(termRef.current);

    setTimeout(() => {
      try { fitAddon.fit(); } catch {}
    }, 50);

    xtermRef.current = term;

    term.writeln('Welcome to Retro Linux!');
    term.writeln('Type "help" for available commands.');
    term.writeln('');
    writePrompt(term);

    term.onData((data) => {
      if (data === '\r') {
        // Enter
        term.writeln('');
        const line = currentLineRef.current;
        if (line.trim()) {
          commandHistoryRef.current.push(line);
          historyIndexRef.current = -1;

          const result = executeCommand(line, {
            currentPath: currentPathRef.current,
            setCurrentPath: updatePath,
            commandHistory: [...commandHistoryRef.current],
          });

          if (result.output === 'CLEAR') {
            term.clear();
          } else if (result.output) {
            if (result.error) {
              term.writeln(`\x1b[31m${result.output}\x1b[0m`);
            } else {
              result.output.split('\n').forEach((l) => term.writeln(l));
            }
          }
        }
        currentLineRef.current = '';
        writePrompt(term);
      } else if (data === '\x7f') {
        // Backspace
        if (currentLineRef.current.length > 0) {
          currentLineRef.current = currentLineRef.current.slice(0, -1);
          term.write('\b \b');
        }
      } else if (data === '\x1b[A') {
        // Arrow Up
        const history = commandHistoryRef.current;
        if (history.length === 0) return;
        if (historyIndexRef.current === -1) {
          historyIndexRef.current = history.length - 1;
        } else if (historyIndexRef.current > 0) {
          historyIndexRef.current--;
        }
        replaceLine(term, history[historyIndexRef.current]);
      } else if (data === '\x1b[B') {
        // Arrow Down
        const history = commandHistoryRef.current;
        if (historyIndexRef.current === -1) return;
        historyIndexRef.current++;
        if (historyIndexRef.current >= history.length) {
          historyIndexRef.current = -1;
          replaceLine(term, '');
        } else {
          replaceLine(term, history[historyIndexRef.current]);
        }
      } else if (data === '\x03') {
        // Ctrl+C
        term.writeln('^C');
        currentLineRef.current = '';
        writePrompt(term);
      } else if (data === '\x0c') {
        // Ctrl+L
        term.clear();
        currentLineRef.current = '';
        writePrompt(term);
      } else if (data >= ' ' || data.length > 1 && !data.startsWith('\x1b')) {
        // Printable chars or pasted text
        currentLineRef.current += data;
        term.write(data);
      }
    });

    // Auto focus
    term.focus();
    const handleClick = () => term.focus();
    const handleWindowFocus = () => term.focus();
    window.addEventListener('click', handleClick);
    window.addEventListener('focus', handleWindowFocus);

    const handleResize = () => {
      try { fitAddon.fit(); } catch {}
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, []);

  function writePrompt(term: Terminal) {
    const path = currentPathRef.current === '/home/user' ? '~' : currentPathRef.current;
    term.write(`\x1b[1;32muser@linux\x1b[0;32m:\x1b[1;32m${path}\x1b[0;32m$ \x1b[0m`);
  }

  function replaceLine(term: Terminal, newLine: string) {
    const len = currentLineRef.current.length;
    for (let i = 0; i < len; i++) term.write('\b \b');
    currentLineRef.current = newLine;
    term.write(newLine);
  }

  return (
    <div
      ref={termRef}
      className="w-full h-full xterm-crt"
      style={{ padding: '16px' }}
    />
  );
}
