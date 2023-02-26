import * as fflate from 'fflate';
import { XMLBuilder } from 'fast-xml-parser';

import type { Epubook, PackageDocument } from '../epub';
import { BundleError } from '../error';

const MIMETYPE = 'application/epub+zip';

/**
 * Bundle epub to zip archive
 *
 * @param epub
 * @returns
 */
export async function bundle(epub: Epubook): Promise<Uint8Array> {
  return new Promise((res, rej) => {
    const opfs = epub
      .packageDocuments()
      .map((opf) => [opf.filename(), fflate.strToU8(makePackageDocument(opf))] as const);

    const abstractContainer: fflate.AsyncZippable = {
      mimetype: fflate.strToU8(MIMETYPE),
      'META-INF': {
        'container.xml': fflate.strToU8(makeContainer(epub))
      },
      ...Object.fromEntries(opfs)
    };

    fflate.zip(
      abstractContainer,
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

  const rootfile = epub.packageDocuments().map((p) => ({
    '@_full-path': p.filename(),
    '@_media-type': 'application/oebps-package+xml',
    '#text': ''
  }));

  return builder.build({
    '?xml': { '#text': '', '@_version': '1.0', '@_encoding': 'UTF-8' },
    container: {
      '@_version': '1.0',
      '@_xmlns': 'urn:oasis:names:tc:opendocument:xmlns:container',
      rootfiles: [
        {
          rootfile
        }
      ]
    }
  });
}

/**
 * Generate package document
 *
 * @param opf
 * @returns
 */
export function makePackageDocument(opf: PackageDocument): string {
  if (opf.version() !== '3.0') {
    throw new BundleError(`Unsupport EPUB spec ${opf.version()}`);
  }

  const builder = new XMLBuilder({
    format: true,
    ignoreAttributes: false,
    suppressUnpairedNode: false,
    unpairedTags: ['rootfile']
  });

  const optionalMetadata: Record<string, any> = {};
  const optionalList: Array<keyof ReturnType<typeof opf.metadata>> = [
    'contributor',
    'coverage',
    'format',
    'publisher',
    'relation',
    'rights',
    'source',
    'subject',
    'type'
  ];
  for (const key of optionalList) {
    const m = opf.metadata();
    if (!!m[key]) {
      optionalMetadata['dc:' + key] = m[key];
    }
  }
  const metadata = {
    'dc:identifier': opf.identifier(),
    'dc:title': opf.title(),
    'dc:language': opf.language(),
    'dc:creator': {
      '@_id': 'creator',
      '@_opf:role': 'aut',
      '@_opf:file-as': opf.creator(),
      '#text': opf.creator()
    },
    'dc:date': opf.metadata().date.toISOString(),
    'dc:description': opf.metadata().description,
    ...optionalMetadata,
    meta: [
      {
        '@_property': 'dcterms:modified',
        '#text': opf.metadata().lastModified.toISOString()
      },
      {
        '@_refines': '#creator',
        '@_property': 'file-as',
        '#text': opf.creator()
      }
    ]
  };

  return builder.build({
    '?xml': { '#text': '', '@_version': '1.0', '@_encoding': 'UTF-8' },
    package: {
      '@_unique-identifier': opf.uniqueIdentifier(),
      '@_version': opf.version(),
      metadata,
      manifest: {},
      spine: {}
    }
  });
}
