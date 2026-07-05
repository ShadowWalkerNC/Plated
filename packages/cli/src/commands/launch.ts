// nexcms launch — spawns the Electron builder app
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export async function cmdLaunch(): Promise<void> {
  console.log('🚀 Starting NexCMS Builder...');

  // Resolve the electron binary from the builder package
  const require = createRequire(import.meta.url);
  let electronBin: string;
  try {
    // In a monorepo install, electron is in packages/builder's node_modules
    const electronPkg = require.resolve('electron/index.js', {
      paths: [resolveBuilderRoot()],
    });
    const electronDir = dirname(electronPkg);
    const pathFile = join(electronDir, 'path.txt');
    const { readFileSync } = await import('node:fs');
    const relPath = readFileSync(pathFile, 'utf-8').trim();
    electronBin = join(electronDir, 'dist', relPath);
  } catch {
    console.error(
      '\u274c Could not locate the Electron binary.\n' +
      '   Run: pnpm install\n' +
      '   Then retry: npx nexcms',
    );
    process.exit(1);
  }

  const builderMain = join(resolveBuilderRoot(), 'dist', 'electron', 'main.js');
  const child = spawn(electronBin, [builderMain], {
    stdio: 'inherit',
    detached: false,
  });

  await new Promise<void>((resolve, reject) => {
    child.on('close', (code) => {
      if (code === 0 || code === null) resolve();
      else reject(new Error(`Electron exited with code ${code}`));
    });
    child.on('error', reject);
  });
}

function resolveBuilderRoot(): string {
  const thisFile = fileURLToPath(import.meta.url);
  // packages/cli/dist/commands/launch.js -> packages/builder
  return join(dirname(thisFile), '..', '..', '..', 'builder');
}
