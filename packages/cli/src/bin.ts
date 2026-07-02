#!/usr/bin/env node
// nexcms binary entry point
import { run } from './cli.js';

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
