import { afterEach, describe, it, expect, vi } from 'vitest';
import { strFromU8, unzipSync, zip } from 'fflate';
import type { FlateCallback, ZipOptions } from 'fflate';
import { XMLParser, XMLValidator } from 'fast-xml-parser';

import { EpubPublication, XHTML, Navigation, Cover } from '@epubook/core';

import { bundle, makeContainerXml, makePackageDocument } from '../src/bundler/bundle.js';
import { BundleError } from '../src/error.js';

vi.mock('fflate', async (importOriginal) => {
  const original = await importOriginal<typeof import('fflate')>();
  return { ...original, zip: vi.fn(original.zip) };
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.mocked(zip).mockReset();
});

describe('Bundle Epub', () => {
  it.each([
    { contributors: [] },
    { contributors: [{ name: '插画师' }] },
    {
      contributors: [
        { name: '插画 & <绘者>', uid: 'illustrator', role: 'ill', fileAs: '绘者' },
        { name: '译者 "甲"' }
      ]
    }
  ])('serializes contributors as separate text elements ($contributors)', ({ contributors }) => {
    const epub = EpubPublication.create('OEBPS/content.opf', {
      contributor: contributors
    });
    const xml = makePackageDocument(epub.rootfile);
    expect(XMLValidator.validate(xml)).toBe(true);

    const parsed = new XMLParser({
      ignoreAttributes: false,
      isArray: (name) => name === 'dc:contributor'
    }).parse(xml);
    expect(parsed.package.metadata['dc:contributor'] ?? []).toEqual(
      contributors.map((author) => author.name)
    );
    if (contributors.length > 1) {
      expect(xml).toContain('<dc:contributor>插画 &amp; &lt;绘者&gt;</dc:contributor>');
    }
  });

  it('includes contributor text and every resource in the ZIP', async () => {
    const epub = EpubPublication.create('OEBPS/content.opf', {
      contributor: [{ name: '插画师' }, { name: '译者' }]
    });
    const chapter = new XHTML('chapter.xhtml', {}, '<html/>');
    const cover = new Cover('images/cover.png', 'image/png', new Uint8Array([1, 2, 3]));
    epub.rootfile.manifest.add(chapter, cover);

    const result = await bundle(epub);
    expect(result).toBeInstanceOf(Uint8Array);
    const files = unzipSync(result);
    expect(strFromU8(files.mimetype)).toBe('application/epub+zip');
    expect(strFromU8(files['META-INF/container.xml'])).toBe(makeContainerXml(epub));
    expect(strFromU8(files['OEBPS/content.opf'])).toBe(makePackageDocument(epub.rootfile));
    expect(strFromU8(files['OEBPS/chapter.xhtml'])).toBe('<html/>');
    expect(files['OEBPS/images/cover.png']).toEqual(new Uint8Array([1, 2, 3]));
  });

  it.each(['reject', 'throw'] as const)('rejects when a resource fails with %s', async (mode) => {
    const epub = EpubPublication.create();
    const resource = new XHTML('chapter.xhtml');
    const error = new Error('Could not load chapter');
    vi.spyOn(resource, 'bundle').mockImplementation(() => {
      if (mode === 'throw') throw error;
      return Promise.reject(error);
    });
    epub.rootfile.manifest.add(resource);

    await expect(bundle(epub)).rejects.toBe(error);
    expect(zip).not.toHaveBeenCalled();
  });

  it('rejects unsupported EPUB versions instead of leaving the promise pending', async () => {
    const epub = EpubPublication.create();
    vi.spyOn(epub.rootfile, 'version', 'get').mockReturnValue('2.0' as '3.0');

    await expect(bundle(epub)).rejects.toBeInstanceOf(BundleError);
    expect(zip).not.toHaveBeenCalled();
  });

  it('propagates metadata serialization errors to the caller', async () => {
    const epub = EpubPublication.create();
    const error = new Error('Could not serialize metadata');
    vi.spyOn(epub.rootfile.metadata.date, 'getUTCFullYear').mockImplementation(() => {
      throw error;
    });

    await expect(bundle(epub)).rejects.toBe(error);
    expect(zip).not.toHaveBeenCalled();
  });

  it('propagates asynchronous ZIP errors to the caller', async () => {
    const error = Object.assign(new Error('Could not create ZIP'), { code: 0 });
    vi.mocked(zip).mockImplementationOnce(
      (_files, options: ZipOptions | FlateCallback, callback?: FlateCallback) => {
        const cb = typeof options === 'function' ? options : callback!;
        queueMicrotask(() => cb(error, new Uint8Array()));
        return () => {};
      }
    );

    await expect(bundle(EpubPublication.create())).rejects.toBe(error);
  });

  it('generate container.xml', () => {
    const epub = EpubPublication.create();
    const res = makeContainerXml(epub);
    expect(res).toMatchInlineSnapshot(`
      "<?xml version="1.0" encoding="UTF-8"?>
      <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
        <rootfiles>
          <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
        </rootfiles>
      </container>
      "
    `);
  });

  it('generate opf', () => {
    const epub = EpubPublication.create('OEBPS/content.opf', {
      title: 'Test Book',
      language: 'zh-CN',
      date: new Date('2023-02-01T11:00:00.000Z'),
      lastModified: new Date('2023-02-26T11:00:00.000Z'),
      creator: { name: 'XLor', fileAs: 'XLor' },
      description: 'for test usage',
      source: 'imagine'
    });

    epub.rootfile.setIdentifier('test-book-id', 'BookId');

    const cover = new Cover('cover.png', 'image/png');
    epub.rootfile.setCover(cover);

    const res = makePackageDocument(epub.rootfile);
    expect(res).toMatchInlineSnapshot(`
      "<?xml version="1.0" encoding="UTF-8"?>
      <package xmlns="http://www.idpf.org/2007/opf" xmlns:epub="http://www.idpf.org/2007/ops" unique-identifier="BookId" version="3.0">
        <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
          <dc:identifier id="BookId">test-book-id</dc:identifier>
          <dc:title>Test Book</dc:title>
          <dc:language>zh-CN</dc:language>
          <dc:creator id="creator">XLor</dc:creator>
          <dc:date>2023-02-01T11:00:00Z</dc:date>
          <dc:description>for test usage</dc:description>
          <dc:source>imagine</dc:source>
          <meta name="cover" content="cover"></meta>
          <meta property="dcterms:modified">2023-02-26T11:00:00Z</meta>
          <meta refines="#creator" property="file-as">XLor</meta>
        </metadata>
        <manifest>
          <item href="cover.png" id="cover" media-type="image/png" properties="cover-image"/>
        </manifest>
        <spine></spine>
      </package>
      "
    `);

    expect(epub.rootfile).toMatchSnapshot();
  });

  it('write epub', async () => {
    const epub = EpubPublication.create('OEBPS/content.opf', {
      title: 'Test Book',
      date: new Date('2023-02-01T11:00:00.000Z'),
      lastModified: new Date('2023-02-26T11:00:00.000Z'),
      creator: { name: 'XLor', fileAs: 'XLor' },
      description: 'for test usage',
      source: 'imagine'
    });

    epub.rootfile.setIdentifier('test-book-id', 'BookId');

    const content = `<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="en">
  <head>
    <title>Data URL does not open in top-level context</title>
    <style>
      code {
        color: #c63501;
      }
    </style>
  </head>
  <body>
    <h1>Data URL does not open in top-level context</h1>
    <p>The following jpeg is contained within a <code>data:</code> URL, which is used as the <code>src</code> attribute for an <code>img</code> element.</p>
    <p>The test passes if you are able to see the image below inside this ebook.</p>
  </body>
</html>`;

    const cover = new XHTML('cover.xhtml', {}, content);
    epub.rootfile.manifest.add(cover);
    epub.rootfile.spine.push(cover.itemref());

    const navigation = new Navigation().update([{ title: 'cover', resource: cover }]);
    epub.rootfile.setNavigation(navigation);

    expect(epub.rootfile).toMatchSnapshot();

    await bundle(epub);
  });

  it('generate toc', async () => {
    const epub = EpubPublication.create('OEBPS/content.opf', {
      title: 'Test Book',
      date: new Date('2023-02-01T11:00:00.000Z'),
      lastModified: new Date('2023-02-26T11:00:00.000Z'),
      creator: {
        name: 'XLor',
        fileAs: 'XLor'
      },
      description: 'for test usage',
      source: 'imagine'
    });

    epub.rootfile.setIdentifier('12345', 'book-id');

    const item1 = new XHTML('page1.xhtml', { title: '', language: '' }, '1');
    const item2 = new XHTML('page2.xhtml', { title: '', language: '' }, '2');
    const item3 = new XHTML('page3.xhtml', { title: '', language: '' }, '3');
    const item4 = new XHTML('page4.xhtml', { title: '', language: '' }, '4');
    const item5 = new XHTML('page5.xhtml', { title: '', language: '' }, '5');

    const navigation = new Navigation().update(
      [
        { title: '1', resource: item1 },
        { title: '2', resource: item2 },
        {
          title: 'Sub',
          children: [
            { title: '3', resource: item3 },
            { title: '4', resource: item4 }
          ]
        },
        { title: '5', resource: item5 }
      ],
      {
        title: 'Toc',
        heading: {
          level: 2
        }
      }
    );

    epub.rootfile.manifest.add(item1, item2, item3, item4, item5);
    epub.rootfile.spine.push(
      item1.itemref(),
      item2.itemref(),
      item3.itemref(),
      item4.itemref(),
      item5.itemref()
    );
    epub.rootfile.setNavigation(navigation);

    expect(epub.rootfile).toMatchSnapshot();

    await bundle(epub);
  });
});
