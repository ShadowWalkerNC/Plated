// nexcms preview — serves the built dist directory locally
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
    console.error(`❌ No built site found at: ${absDir}`);
    console.error('   Run: nexcms export');
    process.exit(1);
  }

  console.log(`🔭 Previewing site at: ${absDir}`);
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
    if (arg.startsWith('--') || arg.startsWith('-')) {
      flags[arg] = args[i + 1] && !args[i + 1].startsWith('-') ? args[++i] : '';
    }
  }
  return flags;
}
