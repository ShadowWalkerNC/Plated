// Plated CLI — init/new command: scaffold a fresh project.plated.json
import { writeFile, access } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { createDefaultSchema } from '../schema.js';

export async function cmdNew(args: string[]): Promise<void> {
  const projectName = args[0] ?? 'my-restaurant';
  const outDir = resolve(process.cwd(), projectName);
  const outFile = join(outDir, 'project.plated.json');

  try {
    await access(outFile);
    console.error(`\u274c A project file already exists at: ${outFile}`);
    process.exit(1);
  } catch {
    // File doesn't exist — good, proceed
  }

  const { mkdir } = await import('node:fs/promises');
  await mkdir(outDir, { recursive: true });

  const schema = createDefaultSchema(projectName);
  await writeFile(outFile, JSON.stringify(schema, null, 2) + '\n', 'utf-8');

  console.log(`\u2705 New project created: ${outFile}`);
  console.log(`\uD83D\uDCDD Open the file and fill in your business details, then run:`);
  console.log(`   plated export --project ${outFile}`);
}
