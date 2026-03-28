import { useEffect, useState, useRef } from 'react';
import { CommandLine } from './CommandLine';
import { TerminalOutput } from './TerminalOutput';
import { executeCommand } from '../utils/commands';

interface OutputLine {
  type: 'command' | 'output' | 'error';
  content: string;
  prompt?: string;
}

export function SimulatedTerminal() {
  const [currentPath, setCurrentPath] = useState('/home/user');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<OutputLine[]>([
    { type: 'output', content: 'Welcome to Retro Linux!' },
    { type: 'output', content: 'Type "help" for available commands.' },
    { type: 'output', content: '' },
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const outputEndRef = useRef<HTMLDivElement>(null);

  const getPrompt = () => {
    const path = currentPath === '/home/user' ? '~' : currentPath;
    return `user@linux:${path}$`;
  };

  const handleSubmit = () => {
    if (!input.trim()) {
      setOutput((prev) => [...prev, { type: 'command', content: '', prompt: getPrompt() }]);
      return;
    }

    const newHistory = [...commandHistory, input];
    setCommandHistory(newHistory);
    setHistoryIndex(-1);

    setOutput((prev) => [...prev, { type: 'command', content: input, prompt: getPrompt() }]);

    const result = executeCommand(input, {
      currentPath,
      setCurrentPath,
      commandHistory: newHistory,
    });

    if (result.output === 'CLEAR') {
      setOutput([]);
    } else if (result.output) {
      setOutput((prev) => [
        ...prev,
        { type: result.error ? 'error' : 'output', content: result.output },
      ]);
    }

    setInput('');
  };

  const handleHistoryUp = () => {
    if (commandHistory.length === 0) return;
    const newIndex =
      historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
    setHistoryIndex(newIndex);
    setInput(commandHistory[newIndex]);
  };

  const handleHistoryDown = () => {
    if (historyIndex === -1) return;
    const newIndex = historyIndex + 1;
    if (newIndex >= commandHistory.length) {
      setHistoryIndex(-1);
      setInput('');
    } else {
      setHistoryIndex(newIndex);
      setInput(commandHistory[newIndex]);
    }
  };

  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 overflow-auto terminal-scroll p-8 pb-4">
        <TerminalOutput lines={output} />
        <div ref={outputEndRef} />
      </div>
      <div className="px-8 pb-8">
        <CommandLine
          prompt={getPrompt()}
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          onHistoryUp={handleHistoryUp}
          onHistoryDown={handleHistoryDown}
        />
      </div>
    </div>
  );
}
