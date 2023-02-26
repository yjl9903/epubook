import * as fflate from 'fflate';
import { XMLBuilder } from 'fast-xml-parser';

import type { Epubook } from './epub';

const MIMETYPE = fflate.strToU8('application/epub+zip');

/**
 * Bundle epub to zip archive
 *
 * @param epub
 * @returns
 */
export async function bundle(epub: Epubook) {
  return new Promise((res, rej) => {
    fflate.zip(
      {
        mimetype: MIMETYPE,
        'META-INF': {
          'container.xml': fflate.strToU8(makeContainer(epub))
        },
        OEBPS: {
          'content.opf': fflate.strToU8('')
        }
      },
      {
        level: 0,
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

/**
 * Generate META-INF/container.xml
 *
 * See: https://www.w3.org/TR/epub-33/#sec-container-metainf-container.xml
 *
 * Example: https://www.w3.org/TR/epub-33/#sec-container-container.xml-example
 *
 * @param epub
 * @returns xml string
 */
export function makeContainer(epub: Epubook): string {
  const builder = new XMLBuilder({
    format: true,
    ignoreAttributes: false,
    suppressUnpairedNode: false,
    unpairedTags: ['rootfile']
  });

  return builder.build({
    '?xml': { '#text': '', '@_version': '1.0', '@_encoding': 'UTF-8' },
    container: {
      '@_version': '1.0',
      '@_xmlns': 'urn:oasis:names:tc:opendocument:xmlns:container',
      rootfiles: [
        {
          rootfile: [
            {
              '@_full-path': 'OEBPS/content.opf',
              '@_media-type': 'application/oebps-package+xml',
              '#text': ''
            }
          ]
        }
      ]
    }
  });
}
