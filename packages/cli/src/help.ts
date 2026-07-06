// CLI help + version output

const VERSION = '0.0.0';

export function printVersion(): void {
  console.log(`plated v${VERSION}`);
}

export function printHelp(): void {
  console.log(`
plated — The restaurant website builder

USAGE
  plated                          Launch the Electron wizard
  plated init [name]              Scaffold a new project file
  plated export [options]         Generate a deployable Astro site
  plated preview [options]        Preview the built site locally

EXPORT OPTIONS
  --project, -p <path>            Path to project.plated.json (default: auto-detect)
  --out, -o <dir>                 Output directory (default: ./dist)
  --source                        Include full Astro source for customization
  --dry-run                       Resolve template without writing files

PREVIEW OPTIONS
  --out, -o <dir>                 Built site directory (default: ./dist)

OTHER
  --version, -v                   Print version
  --help, -h                      Print this help

EXAMPLES
  plated init my-restaurant
  plated export --project ./my-restaurant/project.plated.json --out ./site
  plated export --source
  plated preview
`);
}
