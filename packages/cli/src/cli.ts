// Plated CLI — command router

import { cmdLaunch } from './commands/launch.js';
import { cmdNew } from './commands/new.js';
import { cmdExport } from './commands/export.js';
import { cmdPreview } from './commands/preview.js';
import { printHelp, printVersion } from './help.js';

export async function runCli(argv: string[]): Promise<void> {
  const [command, ...rest] = argv;

  switch (command) {
    case undefined:
    case 'launch':
      return cmdLaunch();

    case 'init':
    case 'new':
      return cmdNew(rest);

    case 'export':
      return cmdExport(rest);

    case 'preview':
      return cmdPreview(rest);

    case '--version':
    case '-v':
      return printVersion();

    case '--help':
    case '-h':
      return printHelp();

    default:
      console.error(`\u274c Unknown command: "${command}"`);
      printHelp();
      process.exit(1);
  }
}
