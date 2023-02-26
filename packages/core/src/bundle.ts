import * as fflate from 'fflate';
import { XMLBuilder } from 'fast-xml-parser';

import type { Epubook } from './epub';

const MIMETYPE = fflate.strToU8('application/epub+zip');

export async function bundle(epub: Epubook) {
  return new Promise((res, rej) => {
    fflate.zip(
      {
        mimetype: MIMETYPE,
        'META-INF': {
          'container.xml': fflate.strToU8('')
        }
      },
      {
        level: 1,
        mtime: new Date()
      },
      (err, data) => {
        if (err) {
          rej(err);
        } else {
          res(data);
        }
      }
    );
  });
}

export function makeContainer(epub: Epubook) {
  const builder = new XMLBuilder({ format: true, ignoreAttributes: false });
  return builder.build({
    '?xml': [{ '#text': '' }],
    container: {
      version: '1.0',
      xmlns: 'urn:oasis:names:tc:opendocument:xmlns:container'
    }
  });
}
