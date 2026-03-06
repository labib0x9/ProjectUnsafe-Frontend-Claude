// ============================================================
//  ProjectUnsafe — API Service Layer
//  All fetch calls go through this file.
//  Mock mode: set VITE_MOCK_API=true in .env (default: true)
// ============================================================

const BASE_URL = 'http://127.0.0.1:8080'
const USE_MOCK = true  // flip to false when backend is ready

// ---- Helpers -----------------------------------------------
function getToken() {
  try {
    const s = localStorage.getItem('pu_session')
    return s ? JSON.parse(s).token : null
  } catch { return null }
}

async function apiFetch(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || 'Request failed')
  }
  return res.json()
}

function delay(ms = 400) {
  return new Promise(r => setTimeout(r, ms))
}

// ---- Mock Data ----------------------------------------------
const MOCK_LABS = [
  {
    id: 'lab-ssh-basics',
    title: 'SSH Basics',
    difficulty: 'easy',
    category: 'networking',
    description: 'Learn to connect to remote machines, manage keys, and tunnel ports using SSH.',
    longDescription: `In this lab you will practice the fundamentals of SSH. You will:
- Connect to a remote host using password and key-based auth
- Generate and manage SSH key pairs
- Use SSH tunneling to forward local ports
- Explore the ~/.ssh/config file

The container runs a minimal Debian image with sshd configured and ready.`,
    hints: [
      'Use ssh-keygen -t ed25519 to generate a modern key pair',
      'Copy your public key with ssh-copy-id user@host',
      'Check /etc/ssh/sshd_config for server settings',
    ],
    completions: 1423,
    estimatedTime: '45 min',
    tags: ['ssh', 'networking', 'linux'],
  },
  {
    id: 'lab-file-permissions',
    title: 'File Permissions & SUID',
    difficulty: 'medium',
    category: 'linux',
    description: 'Understand Unix permissions, SUID/SGID bits, and common privilege escalation vectors.',
    longDescription: `Deep-dive into the Unix permission model. You will:
- Read and modify file permissions with chmod
- Understand SUID, SGID, and sticky bits
- Find SUID binaries on the system
- Exploit a misconfigured SUID binary to escalate privileges

All exploitation is sandboxed inside the container.`,
    hints: [
      'find / -perm -4000 2>/dev/null lists SUID binaries',
      'GTFOBins is your friend for binary exploitation',
      'Check /etc/passwd for writable entries',
    ],
    completions: 987,
    estimatedTime: '1.5 hrs',
    tags: ['permissions', 'privesc', 'linux'],
  },
  {
    id: 'lab-buffer-overflow',
    title: 'Stack Buffer Overflow',
    difficulty: 'hard',
    category: 'exploitation',
    description: 'Smash the stack. Redirect execution. Classic x86 buffer overflow with no mitigations.',
    longDescription: `Classic buffer overflow on a compiled C binary. Protections disabled:
- No ASLR (address space layout randomization)
- No stack canaries
- Executable stack (NX off)

You will:
- Analyze the vulnerable binary with GDB
- Craft a payload to control the instruction pointer
- Jump to your shellcode
- Pop a shell

The container has GDB, pwndbg, and pwntools installed.`,
    hints: [
      'Use cyclic patterns to find the exact offset to EIP',
      'Inspect the stack with x/40wx $esp after the crash',
      'Your shellcode goes on the stack before the return address',
    ],
    completions: 341,
    estimatedTime: '3 hrs',
    tags: ['exploitation', 'binary', 'pwn'],
  },
  {
    id: 'lab-bash-scripting',
    title: 'Bash Scripting for Pentesters',
    difficulty: 'easy',
    category: 'scripting',
    description: 'Write recon and automation scripts. Loops, conditionals, pipes, and process substitution.',
    longDescription: `Hands-on bash scripting in a pentesting context. Topics covered:
- Writing port scanners with /dev/tcp
- Automating recon with loops and conditionals
- Parsing command output with awk, sed, grep
- Background jobs and signal handling`,
    hints: [
      'Use $(command) for command substitution',
      'bash -x script.sh enables debug tracing',
      'Redirect stderr: 2>/dev/null or 2>&1',
    ],
    completions: 2104,
    estimatedTime: '1 hr',
    tags: ['bash', 'scripting', 'automation'],
  },
  {
    id: 'lab-process-injection',
    title: 'Process Injection',
    difficulty: 'hard',
    category: 'exploitation',
    description: 'Inject shellcode into running processes using ptrace on Linux.',
    longDescription: `Advanced lab covering ptrace-based process injection on Linux:
- Attach to a running process with ptrace
- Read and write process memory
- Inject shellcode into the target's address space
- Detach and execute injected code

Requires knowledge of x86_64 assembly and C.`,
    hints: [
      'PTRACE_ATTACH requires CAP_SYS_PTRACE or matching UID',
      'Use PTRACE_POKEDATA to write 8 bytes at a time',
      'Back up the original registers before hijacking RIP',
    ],
    completions: 128,
    estimatedTime: '4+ hrs',
    tags: ['injection', 'ptrace', 'advanced'],
  },
  {
    id: 'lab-c-programming',
    title: 'C Programming',
    difficulty: 'easy',
    category: 'scripting',
    description: 'Write, compile and run C programs in an interactive playground. Practice pointers, memory management, and syscalls.',
    longDescription: `An interactive C programming environment with curated challenges ranging from beginner to advanced.

Topics covered:
- Hello World and basic I/O
- Command-line arguments (argc/argv)
- Dynamic memory allocation (malloc/free)
- Unsafe functions and buffer overflows
- Fork, exec, and process management

Each problem has a code editor, compiler output, and optional hints.
This lab is the gateway to understanding how low-level exploitation actually works.`,
    hints: [
      'Always check the return value of malloc()',
      'Use -fsanitize=address to catch memory bugs early',
      'Read the man page: man 3 printf',
    ],
    completions: 3201,
    estimatedTime: 'self-paced',
    tags: ['c', 'programming', 'memory', 'systems'],
    isPlayground: true,
  },
  {
    id: 'lab-network-scanning',
    title: 'Network Scanning & Enumeration',
    difficulty: 'medium',
    category: 'networking',
    description: 'Map a live network with nmap. Enumerate services, detect OS, and identify vulnerabilities.',
    longDescription: `Use nmap and other tools against a simulated internal network:
- Ping sweeps and host discovery
- Port scanning (SYN, UDP, service detection)
- NSE scripts for vulnerability detection
- Parsing nmap XML output`,
    hints: [
      'nmap -sV -sC enables version and default script scans',
      'Use -oX output.xml for machine-parseable results',
      'Timing template -T4 speeds things up in lab environments',
    ],
    completions: 1876,
    estimatedTime: '1 hr',
    tags: ['nmap', 'recon', 'networking'],
  },
]

const MOCK_PROBLEMS = [
  {
    id: 'p-hello',
    title: 'Hello, Unsafe World',
    difficulty: 'easy',
    description: 'Write a C program that prints "Hello, World!" to stdout.',
    starterCode: `#include <stdio.h>\n\nint main() {\n    // your code here\n    return 0;\n}\n`,
    hints: ['Use printf() from stdio.h', 'Don\'t forget the newline: \\n'],
    expectedOutput: 'Hello, World!\n',
  },
  {
    id: 'p-argv',
    title: 'Command Line Arguments',
    difficulty: 'easy',
    description: 'Print each command-line argument on its own line. Skip argv[0].',
    starterCode: `#include <stdio.h>\n\nint main(int argc, char *argv[]) {\n    // iterate over arguments\n    return 0;\n}\n`,
    hints: ['argc is the argument count', 'argv[0] is the program name'],
    expectedOutput: '(varies with input)',
  },
  {
    id: 'p-malloc',
    title: 'Dynamic Memory Allocation',
    difficulty: 'medium',
    description: 'Allocate an array of N integers on the heap, fill it with squares, print them, then free.',
    starterCode: `#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int n = 10;\n    // allocate, fill, print, free\n    return 0;\n}\n`,
    hints: ['Use malloc(n * sizeof(int))', 'Always check the return value of malloc', 'Use free() when done'],
    expectedOutput: '0 1 4 9 16 25 36 49 64 81\n',
  },
  {
    id: 'p-strcpy-vuln',
    title: 'Unsafe strcpy',
    difficulty: 'medium',
    description: 'Deliberately overflow a stack buffer using strcpy. Observe the crash. This is intentional.',
    starterCode: `#include <stdio.h>\n#include <string.h>\n\nvoid vuln(char *input) {\n    char buf[16];\n    strcpy(buf, input); // unsafe!\n    printf("buf: %s\\n", buf);\n}\n\nint main() {\n    vuln("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");\n    return 0;\n}\n`,
    hints: ['Run with AddressSanitizer: -fsanitize=address', 'The buffer is only 16 bytes', 'What happens to the return address?'],
    expectedOutput: '(stack smash / ASAN report)',
  },
  {
    id: 'p-fork',
    title: 'Fork & Exec',
    difficulty: 'hard',
    description: 'Fork a child process. In the child, exec /bin/echo with arguments. In the parent, wait for the child.',
    starterCode: `#include <stdio.h>\n#include <unistd.h>\n#include <sys/wait.h>\n\nint main() {\n    pid_t pid = fork();\n    if (pid == 0) {\n        // child: exec echo\n    } else {\n        // parent: wait\n    }\n    return 0;\n}\n`,
    hints: ['execve needs the full path and a NULL-terminated argv array', 'waitpid(pid, &status, 0) in the parent', 'Check fork() == -1 for errors'],
    expectedOutput: 'hello from child\n',
  },
]

const MOCK_CONTAINERS = [
  { id: 'c1a2b3', userId: 'user_1', username: 'labib', labId: 'lab-ssh-basics', labTitle: 'SSH Basics', status: 'running', startedAt: new Date(Date.now() - 1200000).toISOString(), port: 32001 },
  { id: 'd4e5f6', userId: 'anon_3921', username: 'anon_3921', labId: 'lab-file-permissions', labTitle: 'File Permissions', status: 'running', startedAt: new Date(Date.now() - 600000).toISOString(), port: 32002 },
  { id: 'a7b8c9', userId: 'user_2', username: 'r00tkit', labId: 'lab-buffer-overflow', labTitle: 'Stack Buffer Overflow', status: 'running', startedAt: new Date(Date.now() - 3600000).toISOString(), port: 32003 },
]

// ---- Auth --------------------------------------------------
export const authService = {
  async login(username, password) {
    await delay()
    if (USE_MOCK) {
      if (username === 'admin' && password === 'admin') {
        return { user: { id: 'admin_1', username: 'admin', email: 'admin@unsafe.io', isAdmin: true }, token: 'mock-admin-token' }
      }
      return { user: { id: 'user_1', username, email: `${username}@unsafe.io`, isAdmin: false }, token: 'mock-user-token' }
    }
    return apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) })
  },

  async signup(username, email, password) {
    await delay()
    if (USE_MOCK) {
      return { user: { id: 'user_new', username, email, isAdmin: false }, token: 'mock-new-token' }
    }
    return apiFetch('/auth/signup', { method: 'POST', body: JSON.stringify({ username, email, password }) })
  },

  async loginAnonymous() {
    await delay()
    if (USE_MOCK) {
      const id = `anon_${Math.floor(Math.random() * 9000 + 1000)}`
      return { user: { id, username: id, isAdmin: false, isAnonymous: true }, token: `mock-anon-${id}` }
    }
    return apiFetch('/auth/anonymous', { method: 'POST' })
  },

  async resetPassword(email) {
    await delay()
    if (USE_MOCK) return { message: 'Reset email sent (mock)' }
    return apiFetch('/auth/reset-password', { method: 'POST', body: JSON.stringify({ email }) })
  }
}

// ---- Labs --------------------------------------------------
export const labService = {
  async getLabs() {
    await delay()
    if (USE_MOCK) return MOCK_LABS
    return apiFetch('/labs')
  },

  async getLab(id) {
    await delay()
    if (USE_MOCK) return MOCK_LABS.find(l => l.id === id) || null
    return apiFetch(`/lab/${id}`)
  },

  async startLab(labId) {
    await delay(800)
    if (USE_MOCK) {
      return {
        containerId: Math.random().toString(36).slice(2, 8),
        wsUrl: `ws://localhost:8080/ws/terminal/${labId}`,
        status: 'running',
        message: `Container started for lab ${labId}`
      }
    }
    return apiFetch('/lab/start', { method: 'POST', body: JSON.stringify({ labId }) })
  },

  async resetLab(containerId) {
    await delay(600)
    if (USE_MOCK) return { status: 'reset', message: 'Container reset' }
    return apiFetch('/lab/reset', { method: 'POST', body: JSON.stringify({ containerId }) })
  },

  async terminateLab(containerId) {
    await delay(400)
    if (USE_MOCK) return { status: 'terminated' }
    return apiFetch('/lab/terminate', { method: 'POST', body: JSON.stringify({ containerId }) })
  },

  async getHints(labId) {
    await delay(200)
    if (USE_MOCK) {
      const lab = MOCK_LABS.find(l => l.id === labId)
      return lab?.hints || []
    }
    return apiFetch(`/lab/hints?labId=${labId}`)
  }
}

// ---- Playground --------------------------------------------
export const playgroundService = {
  async getProblems() {
    await delay()
    if (USE_MOCK) return MOCK_PROBLEMS.map(({ id, title, difficulty }) => ({ id, title, difficulty }))
    return apiFetch('/problems')
  },

  async getProblem(id) {
    await delay()
    if (USE_MOCK) return MOCK_PROBLEMS.find(p => p.id === id) || null
    return apiFetch(`/problem/${id}`)
  },

  async runCode(problemId, code, customCommand = null) {
    await delay(1200)
    if (USE_MOCK) {
      return {
        stdout: `[mock] Compiled and ran code for problem ${problemId}\n> ${customCommand || './a.out'}\nHello, World!\n`,
        stderr: '',
        exitCode: 0,
        elapsed: '0.043s'
      }
    }
    const endpoint = customCommand ? '/code/run-custom' : '/code/run'
    return apiFetch(endpoint, { method: 'POST', body: JSON.stringify({ problemId, code, customCommand }) })
  }
}

// ---- Admin -------------------------------------------------
export const adminService = {
  async getContainers() {
    await delay()
    if (USE_MOCK) return MOCK_CONTAINERS
    return apiFetch('/admin/containers')
  },

  async getUsers() {
    await delay()
    if (USE_MOCK) return [
      { id: 'user_1', username: 'labib', email: 'labib@unsafe.io', role: 'user', createdAt: '2024-01-15' },
      { id: 'user_2', username: 'r00tkit', email: 'r00tkit@unsafe.io', role: 'user', createdAt: '2024-02-20' },
      { id: 'admin_1', username: 'admin', email: 'admin@unsafe.io', role: 'admin', createdAt: '2024-01-01' },
    ]
    return apiFetch('/admin/users')
  },

  async terminateContainer(containerId) {
    await delay(400)
    if (USE_MOCK) return { terminated: true, containerId }
    return apiFetch('/admin/terminate', { method: 'POST', body: JSON.stringify({ containerId }) })
  }
}
