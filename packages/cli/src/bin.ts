#!/usr/bin/env node
// Plated CLI — bin entrypoint
// Invoked by: npx plated [command] [options]

import { runCli } from './cli.js';

runCli(process.argv.slice(2)).catch((err) => {
  console.error('\n\u274c Plated error:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
