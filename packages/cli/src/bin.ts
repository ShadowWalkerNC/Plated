#!/usr/bin/env node
// nexcms CLI — bin entrypoint
// Invoked by: npx nexcms [command] [options]

import { runCli } from './cli.js';

runCli(process.argv.slice(2)).catch((err) => {
  console.error('\n❌ NexCMS error:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
