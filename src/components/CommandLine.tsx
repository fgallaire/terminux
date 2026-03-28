import React, { useEffect, useRef } from 'react';

interface CommandLineProps {
  prompt: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onHistoryUp: () => void;
  onHistoryDown: () => void;
}

export function CommandLine({
  prompt,
  value,
  onChange,
  onSubmit,
  onHistoryUp,
  onHistoryDown,
}: CommandLineProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      onHistoryUp();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      onHistoryDown();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="terminal-text text-lg font-mono whitespace-nowrap">
        {prompt}
      </span>
      <div className="flex-1 relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent border-none outline-none terminal-text text-lg font-mono"
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
        <span
          className="absolute top-0 terminal-text text-lg font-mono cursor-blink pointer-events-none"
          style={{ left: `${value.length * 0.6}em` }}
        >
          █
        </span>
      </div>
    </div>
  );
}
