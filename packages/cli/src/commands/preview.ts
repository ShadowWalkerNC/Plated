// Plated CLI — preview command: serves the built dist directory locally
import { spawn } from 'node:child_process';
import { resolve, join } from 'node:path';
import { access } from 'node:fs/promises';

export async function cmdPreview(args: string[]): Promise<void> {
  const flags = parseFlags(args);
  const distDir = flags['--out'] ?? flags['-o'] ?? join(process.cwd(), 'dist');
  const absDir = resolve(distDir);

  try {
    await access(join(absDir, 'package.json'));
  } catch {
    console.error(`\u274c No built site found at: ${absDir}`);
    console.error('   Run: plated export');
    process.exit(1);
  }

  console.log(`\uD83D\uDD2D Previewing site at: ${absDir}`);
  console.log('   Press Ctrl+C to stop.\n');

  const child = spawn('npm', ['run', 'preview'], {
    cwd: absDir,
    stdio: 'inherit',
    shell: true,
  });

  await new Promise<void>((resolve, reject) => {
    child.on('close', (code) => {
      if (code === 0 || code === null) resolve();
      else reject(new Error(`Preview server exited with code ${code}`));
    });
    child.on('error', reject);
  });
}

function parseFlags(args: string[]): Record<string, string> {
  const flags: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg && (arg.startsWith('--') || arg.startsWith('-'))) {
      const next = args[i + 1];
      flags[arg] = next && !next.startsWith('-') ? args[++i]! : '';
    }
  }
  return flags;
}
