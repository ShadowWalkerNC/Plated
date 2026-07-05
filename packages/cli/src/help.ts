// CLI help + version output

const VERSION = '0.0.0';

export function printVersion(): void {
  console.log(`nexcms v${VERSION}`);
}

export function printHelp(): void {
  console.log(`
nexcms — The hospitality website builder

USAGE
  nexcms                          Launch the Electron wizard
  nexcms new [name]               Scaffold a new project file
  nexcms export [options]         Generate a deployable Astro site
  nexcms preview [options]        Preview the built site locally

EXPORT OPTIONS
  --project, -p <path>            Path to project.nexcms.json (default: auto-detect)
  --out, -o <dir>                 Output directory (default: ./dist)
  --source                        Include full Astro source for customization
  --dry-run                       Resolve template without writing files

PREVIEW OPTIONS
  --out, -o <dir>                 Built site directory (default: ./dist)

OTHER
  --version, -v                   Print version
  --help, -h                      Print this help

EXAMPLES
  nexcms new my-restaurant
  nexcms export --project ./my-restaurant/project.nexcms.json --out ./site
  nexcms export --source
  nexcms preview
`);
}
