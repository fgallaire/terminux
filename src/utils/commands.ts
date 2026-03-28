import { getNode, resolvePath } from './filesystem';

export interface CommandResult {
  output: string;
  error?: boolean;
}

export interface CommandContext {
  currentPath: string;
  setCurrentPath: (path: string) => void;
  commandHistory: string[];
}

const NEOFETCH_ASCII = `
    .---.
   /     \\
   \\.@-@./
   /\`\\_/\`\\
  //  _  \\\\
 | \\     )|_
/\`\\_\`>  <_/ \\
\\__/'---'\\__/
`;

export function executeCommand(
  input: string,
  context: CommandContext
): CommandResult {
  const parts = input.trim().split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  switch (command) {
    case 'ls':
      return handleLs(args, context);
    case 'cd':
      return handleCd(args, context);
    case 'pwd':
      return handlePwd(context);
    case 'cat':
      return handleCat(args, context);
    case 'echo':
      return handleEcho(args);
    case 'clear':
      return { output: 'CLEAR' };
    case 'help':
      return handleHelp();
    case 'whoami':
      return { output: 'user' };
    case 'date':
      return { output: new Date().toString() };
    case 'uname':
      return handleUname(args);
    case 'hostname':
      return { output: 'linux-terminal' };
    case 'mkdir':
      return { output: 'mkdir: operation not supported in this simulation' };
    case 'touch':
      return { output: 'touch: operation not supported in this simulation' };
    case 'rm':
      return { output: 'rm: operation not supported in this simulation' };
    case 'history':
      return handleHistory(context);
    case 'neofetch':
      return handleNeofetch();
    case '':
      return { output: '' };
    default:
      return {
        output: `bash: ${command}: command not found`,
        error: true,
      };
  }
}

function handleLs(args: string[], context: CommandContext): CommandResult {
  const showAll =
    args.includes('-a') || args.includes('-la') || args.includes('-al');
  const longFormat =
    args.includes('-l') || args.includes('-la') || args.includes('-al');

  const node = getNode(context.currentPath);
  if (!node || node.type !== 'directory' || !node.children) {
    return { output: 'ls: cannot access directory', error: true };
  }

  const entries = Object.values(node.children);
  const filtered = showAll
    ? entries
    : entries.filter((e) => !e.name.startsWith('.'));

  if (longFormat) {
    const lines = filtered.map((entry) => {
      const type = entry.type === 'directory' ? 'd' : '-';
      const perms = entry.type === 'directory' ? 'rwxr-xr-x' : 'rw-r--r--';
      const size = entry.content?.length || 4096;
      const date = 'Jan 15 10:30';
      return `${type}${perms} 1 user user ${size.toString().padStart(6)} ${date} ${entry.name}`;
    });
    return { output: lines.join('\n') };
  }

  return { output: filtered.map((e) => e.name).join('  ') };
}

function handleCd(args: string[], context: CommandContext): CommandResult {
  if (args.length === 0) {
    context.setCurrentPath('/home/user');
    return { output: '' };
  }

  const targetPath = resolvePath(context.currentPath, args[0]);
  const node = getNode(targetPath);

  if (!node) {
    return { output: `cd: ${args[0]}: No such file or directory`, error: true };
  }

  if (node.type !== 'directory') {
    return { output: `cd: ${args[0]}: Not a directory`, error: true };
  }

  context.setCurrentPath(targetPath);
  return { output: '' };
}

function handlePwd(context: CommandContext): CommandResult {
  return { output: context.currentPath || '/' };
}

function handleCat(args: string[], context: CommandContext): CommandResult {
  if (args.length === 0) {
    return { output: 'cat: missing file operand', error: true };
  }

  const targetPath = resolvePath(context.currentPath, args[0]);
  const node = getNode(targetPath);

  if (!node) {
    return { output: `cat: ${args[0]}: No such file or directory`, error: true };
  }

  if (node.type !== 'file') {
    return { output: `cat: ${args[0]}: Is a directory`, error: true };
  }

  return { output: node.content || '' };
}

function handleEcho(args: string[]): CommandResult {
  return { output: args.join(' ') };
}

function handleHelp(): CommandResult {
  const commands = [
    'Available commands:',
    '',
    '  ls [-l] [-a]    - list directory contents',
    '  cd [dir]        - change directory',
    '  pwd             - print working directory',
    '  cat <file>      - display file contents',
    '  echo <text>     - display text',
    '  clear           - clear the terminal',
    '  whoami          - print current user',
    '  date            - display current date and time',
    '  uname [-a]      - print system information',
    '  hostname        - print system hostname',
    '  history         - show command history',
    '  neofetch        - display system information with ASCII art',
    '  help            - show this help message',
    '',
    'Use arrow keys (↑/↓) to navigate command history.',
  ];

  return { output: commands.join('\n') };
}

function handleUname(args: string[]): CommandResult {
  if (args.includes('-a')) {
    return {
      output:
        'Linux linux-terminal 5.15.0-retro #1 SMP Mon Jan 15 10:23:45 UTC 2024 x86_64 GNU/Linux',
    };
  }
  return { output: 'Linux' };
}

function handleHistory(context: CommandContext): CommandResult {
  const lines = context.commandHistory.map((cmd, i) => `  ${i + 1}  ${cmd}`);
  return { output: lines.join('\n') };
}

function handleNeofetch(): CommandResult {
  const info = [
    NEOFETCH_ASCII,
    '  user@linux-terminal',
    '  -------------------',
    '  OS: Retro Linux 1.0 x86_64',
    '  Kernel: 5.15.0-retro',
    '  Uptime: 2 hours, 34 mins',
    '  Shell: bash 5.1.16',
    '  Terminal: retro-term',
    '  CPU: Virtual CPU @ 3.40GHz',
    '  Memory: 512MiB / 2048MiB',
    '',
  ];

  return { output: info.join('\n') };
}
