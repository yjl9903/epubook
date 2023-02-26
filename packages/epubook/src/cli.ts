import { breadc } from 'breadc';

import { version } from '../package.json';

const cli = breadc('epubook', {
  version,
  description: 'Generate EPUB books'
});

cli.command('').action(() => {});

cli.run(process.argv.slice(2)).catch((err) => console.error(err));
