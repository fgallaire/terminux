export interface FileNode {
  type: 'file' | 'directory';
  name: string;
  content?: string;
  children?: { [key: string]: FileNode };
}

export const filesystem: { [key: string]: FileNode } = {
  home: {
    type: 'directory',
    name: 'home',
    children: {
      user: {
        type: 'directory',
        name: 'user',
        children: {
          Documents: {
            type: 'directory',
            name: 'Documents',
            children: {
              'readme.txt': {
                type: 'file',
                name: 'readme.txt',
                content:
                  'Welcome to the retro terminal!\n\nThis is a simulated Linux environment.\nTry commands like: ls, cd, cat, neofetch, help\n\nHave fun exploring!',
              },
            },
          },
          Downloads: {
            type: 'directory',
            name: 'Downloads',
            children: {},
          },
          Desktop: {
            type: 'directory',
            name: 'Desktop',
            children: {},
          },
          '.bashrc': {
            type: 'file',
            name: '.bashrc',
            content:
              '# ~/.bashrc: executed by bash for non-login shells\n\nexport PS1="\\u@linux:\\w\\$ "\nexport PATH=/usr/local/bin:/usr/bin:/bin\n\nalias ll="ls -la"\nalias la="ls -a"\nalias l="ls -CF"',
          },
          '.profile': {
            type: 'file',
            name: '.profile',
            content:
              '# ~/.profile: executed by the command interpreter for login shells\n\nif [ -f ~/.bashrc ]; then\n    . ~/.bashrc\nfi',
          },
        },
      },
    },
  },
  etc: {
    type: 'directory',
    name: 'etc',
    children: {
      hostname: {
        type: 'file',
        name: 'hostname',
        content: 'linux-terminal',
      },
      hosts: {
        type: 'file',
        name: 'hosts',
        content:
          '127.0.0.1\tlocalhost\n127.0.1.1\tlinux-terminal\n\n::1\t\tlocalhost ip6-localhost ip6-loopback',
      },
      'os-release': {
        type: 'file',
        name: 'os-release',
        content:
          'NAME="Retro Linux"\nVERSION="1.0 (Nostalgic)"\nID=retro\nID_LIKE=debian\nPRETTY_NAME="Retro Linux 1.0"\nVERSION_ID="1.0"',
      },
    },
  },
  var: {
    type: 'directory',
    name: 'var',
    children: {
      log: {
        type: 'directory',
        name: 'log',
        children: {
          syslog: {
            type: 'file',
            name: 'syslog',
            content:
              'Jan 15 10:23:45 linux kernel: [    0.000000] Linux version 5.15.0-retro\nJan 15 10:23:45 linux kernel: [    0.000000] Command line: BOOT_IMAGE=/boot/vmlinuz\nJan 15 10:23:45 linux systemd[1]: Started System Logging Service.\nJan 15 10:23:46 linux systemd[1]: Reached target Multi-User System.',
          },
        },
      },
    },
  },
};

export function resolvePath(currentPath: string, targetPath: string): string {
  if (targetPath.startsWith('/')) {
    return targetPath;
  }

  if (targetPath === '..') {
    const parts = currentPath.split('/').filter((p) => p);
    parts.pop();
    return '/' + parts.join('/');
  }

  if (targetPath === '.') {
    return currentPath;
  }

  const parts = currentPath.split('/').filter((p) => p);
  const targetParts = targetPath.split('/').filter((p) => p);

  for (const part of targetParts) {
    if (part === '..') {
      parts.pop();
    } else if (part !== '.') {
      parts.push(part);
    }
  }

  return '/' + parts.join('/');
}

export function getNode(path: string): FileNode | null {
  if (path === '/' || path === '') {
    return {
      type: 'directory',
      name: '/',
      children: filesystem,
    };
  }

  const parts = path.split('/').filter((p) => p);
  let current: FileNode | undefined = {
    type: 'directory',
    name: '/',
    children: filesystem,
  };

  for (const part of parts) {
    if (!current || current.type !== 'directory' || !current.children) {
      return null;
    }
    current = current.children[part];
  }

  return current || null;
}
