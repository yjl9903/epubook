import { breadc } from 'breadc';

import { version } from '../package.json';

const cli = breadc('epubook', {
  version,
  description: 'Generate EPUB books'
});

cli
  .command('<input>', 'Bundle input document to EPUB')
  .alias('bundle')
  .option('-t, --theme <theme>', 'Override default theme', { default: '@epubook/theme-default' })
  .option('-o, --output <book>', 'Output EPUB name')
  .action((md: string) => {});

cli
  .command('extract <epub>', 'Extract EPUB bundle')
  .option('-o, --out-dir <dir>', 'Output directory')
  .action((p) => {});

cli
  .command('compress <dir>', 'Compress EPUB bundle')
  .option('-o, --output <epub>', 'Output EPUB name')
  .action((d) => {});

cli.run(process.argv.slice(2)).catch((err) => console.error(err));
