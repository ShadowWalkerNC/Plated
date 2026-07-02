// nexcms CLI — command dispatcher
// Phase 1 stub — implementation begins Phase 1 (Jul–Sep 2026)

const COMMANDS = ['new', 'export', 'preview'] as const;
type Command = typeof COMMANDS[number];

export async function run(args: string[] = process.argv.slice(2)): Promise<void> {
  const command = args[0] as Command | undefined;

  switch (command) {
    case undefined:
    case 'new':
      console.log('NexCMS — guided website builder');
      console.log('Builder UI not yet available. Phase 1 in progress.');
      break;
    case 'export':
      console.log('Export not yet available. Phase 1 in progress.');
      break;
    case 'preview':
      console.log('Preview not yet available. Phase 1 in progress.');
      break;
    default:
      console.error(`Unknown command: ${command}`);
      console.error(`Available commands: ${COMMANDS.join(', ')}`);
      process.exit(1);
  }
}
