import * as path from 'pathe';
import * as fflate from 'fflate';
import { XMLBuilder } from 'fast-xml-parser';

import type { EpubPublication, Rendition, Item, ItemRef } from '@epubook/core';

import { MIMETYPE } from '@epubook/core';

import { BundleError } from '../error.js';
import { toISO8601String } from '../utils/index.js';

/**
 * Bundle epub to zip archive
 *
 * @param epub
 * @returns
 */
export async function bundle(epub: EpubPublication): Promise<Uint8Array> {
  return new Promise(async (res, rej) => {
    const opfs = epub.rootfiles.map(
      (opf) => [opf.path, fflate.strToU8(makePackageDocument(opf))] as const
    );

    const items: Record<string, Uint8Array> = {};
    for (const opf of epub.rootfiles) {
      const base = path.dirname(opf.path);
      for (const item of opf.manifest.resources) {
        const name = path.join(base, item.path);
        if (name in items) {
          continue;
        }
        try {
          // TODO: parallel here
          items[name] = await item.bundle();
        } catch (error) {
          console.error(error);
        }
      }
    }

    const abstractContainer: fflate.AsyncZippable = {
      mimetype: fflate.strToU8(MIMETYPE),
      'META-INF': {
        'container.xml': fflate.strToU8(makeContainerXml(epub))
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
export function makeContainerXml(epub: EpubPublication): string {
  const builder = new XMLBuilder({
    format: true,
    ignoreAttributes: false,
    suppressUnpairedNode: false,
    unpairedTags: ['rootfile']
  });

  const rootfile = epub.rootfiles.map((p) => ({
    '@_full-path': p.path,
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
export function makePackageDocument(rendition: Rendition): string {
  if (rendition.version !== '3.0') {
    throw new BundleError(`Unsupport EPUB spec ${rendition.version}`);
  }

  const builder = new XMLBuilder({
    format: true,
    ignoreAttributes: false,
    suppressUnpairedNode: false,
    unpairedTags: ['item', 'itemref']
  });

  const optionalMetadata: Record<string, any> = {};
  const optionalList: Array<keyof typeof rendition.metadata> = [
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
    const m = rendition.metadata;
    if (!!m[key]) {
      optionalMetadata['dc:' + key] = m[key];
    }
  }

  const metadata = {
    '@_xmlns:dc': 'http://purl.org/dc/elements/1.1/',
    'dc:identifier': {
      '@_id': rendition.uniqueIdentifier,
      '#text': rendition.identifier
    },
    'dc:title': rendition.title,
    'dc:language': rendition.language,
    'dc:creator': {
      '@_id': rendition.creator.uid,
      '#text': rendition.creator.name
    },
    'dc:date': toISO8601String(rendition.metadata.date),
    'dc:description': rendition.metadata.description,
    ...optionalMetadata,
    meta: [
      {
        '@_property': 'dcterms:modified',
        '#text': toISO8601String(rendition.metadata.lastModified)
      },
      {
        '@_refines': '#' + rendition.creator.uid,
        '@_property': 'file-as',
        '#text': rendition.creator?.fileAs ?? rendition.creator.name
      }
    ] as any[]
  };

  if (rendition.cover) {
    metadata.meta.unshift({
      '@_name': 'cover',
      '@_content': rendition.cover.id
    });
  }

  function makeManifestItem(item: Item) {
    return {
      '@_fallback': item.fallback(),
      '@_href': item.href(),
      '@_id': item.id(),
      '@_media-overlay': item.mediaOverlay(),
      '@_media-type': item.mediaType(),
      '@_properties': item.properties()
    };
  }

  function makeManifestItemRef(item: ItemRef) {
    return {
      '@_idref': item.idref()
    };
  }

  return builder.build({
    '?xml': { '#text': '', '@_version': '1.0', '@_encoding': 'UTF-8' },
    package: {
      '@_xmlns': 'http://www.idpf.org/2007/opf',
      '@_xmlns:epub': 'http://www.idpf.org/2007/ops',
      '@_unique-identifier': rendition.uniqueIdentifier,
      '@_version': rendition.version,
      metadata,
      manifest: {
        item: rendition.manifest.resources.map((i) => makeManifestItem(i.item()))
      },
      spine: {
        itemref: rendition.spine.itemrefs.map((ir) => makeManifestItemRef(ir))
      }
    }
  });
}
