interface OutputLine {
  type: 'command' | 'output' | 'error';
  content: string;
  prompt?: string;
}

interface TerminalOutputProps {
  lines: OutputLine[];
}

export function TerminalOutput({ lines }: TerminalOutputProps) {
  return (
    <div className="space-y-1">
      {lines.map((line, index) => (
        <div key={index} className="font-mono text-lg leading-relaxed">
          {line.type === 'command' && (
            <div className="terminal-text">
              <span className="opacity-90">{line.prompt}</span>
              <span className="ml-2">{line.content}</span>
            </div>
          )}
          {line.type === 'output' && (
            <pre className="terminal-text whitespace-pre-wrap break-words">
              {line.content}
            </pre>
          )}
          {line.type === 'error' && (
            <pre className="text-red-400 whitespace-pre-wrap break-words">
              {line.content}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}
