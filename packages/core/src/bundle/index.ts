import * as path from 'pathe';
import * as fflate from 'fflate';
import { XMLBuilder } from 'fast-xml-parser';

import type { Epubook, ManifestItem, ManifestItemRef, PackageDocument } from '../epub';

import { MIMETYPE } from '../constant';
import { BundleError } from '../error';
import { toISO8601String } from '../utils';

/**
 * Bundle epub to zip archive
 *
 * @param epub
 * @returns
 */
export async function bundle(epub: Epubook): Promise<Uint8Array> {
  return new Promise(async (res, rej) => {
    const opfs = epub
      .packageDocuments()
      .map((opf) => [opf.filename(), fflate.strToU8(makePackageDocument(opf))] as const);

    const items: Record<string, Uint8Array> = {};
    for (const opf of epub.packageDocuments()) {
      const base = path.dirname(opf.filename());
      for (const item of opf.items()) {
        const name = path.join(base, item.filename());
        if (name in items) {
          continue;
        }
        // TODO: parallel here
        items[name] = await item.bundle();
      }
    }

    const abstractContainer: fflate.AsyncZippable = {
      mimetype: fflate.strToU8(MIMETYPE),
      'META-INF': {
        'container.xml': fflate.strToU8(makeContainer(epub))
      },
      ...Object.fromEntries(opfs),
      ...items
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
    unpairedTags: ['item', 'itemref']
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
    '@_xmlns:dc': 'http://purl.org/dc/elements/1.1/',
    'dc:identifier': {
      '@_id': opf.uniqueIdentifier(),
      '#text': opf.identifier()
    },
    'dc:title': opf.title(),
    'dc:language': opf.language(),
    'dc:creator': {
      '@_id': 'creator',
      '#text': opf.creator()
    },
    'dc:date': toISO8601String(opf.metadata().date),
    'dc:description': opf.metadata().description,
    ...optionalMetadata,
    meta: [
      {
        '@_property': 'dcterms:modified',
        '#text': toISO8601String(opf.metadata().lastModified)
      },
      {
        '@_refines': '#creator',
        '@_property': 'file-as',
        '#text': opf.creator()
      }
    ]
  };

  function makeManifestItem(item: ManifestItem) {
    return {
      '@_fallback': item.fallback(),
      '@_href': item.href(),
      '@_id': item.id(),
      '@_media-overlay': item.mediaOverlay(),
      '@_media-type': item.mediaType(),
      '@_properties': item.properties()
    };
  }

  function makeManifestItemRef(item: ManifestItemRef) {
    return {
      '@_idref': item.idref()
    };
  }

  return builder.build({
    '?xml': { '#text': '', '@_version': '1.0', '@_encoding': 'UTF-8' },
    package: {
      '@_xmlns': 'http://www.idpf.org/2007/opf',
      '@_xmlns:epub': 'http://www.idpf.org/2007/ops',
      '@_unique-identifier': opf.uniqueIdentifier(),
      '@_version': opf.version(),
      metadata,
      manifest: {
        item: opf.manifest().map((i) => makeManifestItem(i))
      },
      spine: {
        itemref: opf.spine().map((ir) => makeManifestItemRef(ir))
      }
    }
  });
}
