// CLI help + version output

const VERSION = '0.0.0';

export function printVersion(): void {
  console.log(`plated v${VERSION}`);
}

export function printHelp(): void {
  console.log(`
plated \u2014 The restaurant website builder

USAGE
  plated                          Launch the Electron wizard
  plated init [name]              Scaffold a new project file
  plated export [options]         Generate a deployable Astro site
  plated export --source [opts]   Write the full Astro source tree
  plated preview [options]        Preview the built site locally
  plated validate [options]       Check a project file for errors

EXPORT OPTIONS
  --project, -p <path>            Path to project.plated.json (default: auto-detect)
  --out, -o <dir>                 Output directory (default: ./dist)
  --source                        Write editable Astro source (default out: ./dist-source)
  --dry-run                       Plan files without writing to disk

PREVIEW OPTIONS
  --out, -o <dir>                 Built site directory (default: ./dist)

VALIDATE OPTIONS
  --project, -p <path>            Path to project.plated.json (default: auto-detect)

OTHER
  --version, -v                   Print version
  --help, -h                      Print this help

EXAMPLES
  plated init my-restaurant
  plated export --project ./my-restaurant/project.plated.json --out ./site
  plated export --source --out ./site-src
  plated validate --project ./project.plated.json
  plated preview
`);
}
