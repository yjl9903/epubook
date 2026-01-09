import { describe, it, expect } from 'vitest';

import { EpubPublication, XHTML, Navigation, Cover } from '@epubook/core';

import { bundle, makeContainerXml, makePackageDocument } from '../src/bundler/bundle.js';

describe('Bundle Epub', () => {
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
