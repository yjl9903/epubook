import { describe, it, expect } from 'vitest';

import { Epub, HTML } from '../src';
import { makeContainer, makePackageDocument } from '../src/bundle';

describe('Bundle Epub', () => {
  it('generate container.xml', () => {
    const res = makeContainer(new Epub());
    expect(res).toMatchInlineSnapshot(`
      "<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?>
      <container version=\\"1.0\\" xmlns=\\"urn:oasis:names:tc:opendocument:xmlns:container\\">
        <rootfiles>
          <rootfile full-path=\\"OEBPS/content.opf\\" media-type=\\"application/oebps-package+xml\\"/>
        </rootfiles>
      </container>
      "
    `);
  });

  it('generate opf', () => {
    const epub = new Epub();

    const opf = epub.main();
    opf.setIdentifier('test-book-id', 'BookId');
    opf.update({
      title: 'Test Book',
      language: 'zh-CN',
      date: new Date('2023-02-01T11:00:00.000Z'),
      lastModified: new Date('2023-02-26T11:00:00.000Z'),
      creator: { name: 'XLor', fileAs: 'XLor' },
      description: 'for test usage',
      source: 'imagine'
    });

    const cover = new HTML('cover.xhtml', '');
    epub.item(cover).spine(cover);

    const res = makePackageDocument(opf);
    expect(res).toMatchInlineSnapshot(`
      "<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?>
      <package xmlns=\\"http://www.idpf.org/2007/opf\\" xmlns:epub=\\"http://www.idpf.org/2007/ops\\" unique-identifier=\\"BookId\\" version=\\"3.0\\">
        <metadata xmlns:dc=\\"http://purl.org/dc/elements/1.1/\\">
          <dc:identifier id=\\"BookId\\">test-book-id</dc:identifier>
          <dc:title>Test Book</dc:title>
          <dc:language>zh-CN</dc:language>
          <dc:creator id=\\"creator\\">XLor</dc:creator>
          <dc:date>2023-02-01T11:00:00Z</dc:date>
          <dc:description>for test usage</dc:description>
          <dc:source>imagine</dc:source>
          <meta property=\\"dcterms:modified\\">2023-02-26T11:00:00Z</meta>
          <meta refines=\\"#creator\\" property=\\"file-as\\">XLor</meta>
        </metadata>
        <manifest>
          <item href=\\"cover.xhtml\\" id=\\"cover\\" media-type=\\"application/xhtml+xml\\"/>
        </manifest>
        <spine>
          <itemref idref=\\"cover\\"/>
        </spine>
      </package>
      "
    `);
  });

  it('write epub', async () => {
    const epub = new Epub({
      title: 'Test Book',
      date: new Date('2023-02-01T11:00:00.000Z'),
      lastModified: new Date('2023-02-26T11:00:00.000Z'),
      creator: { name: 'XLor', fileAs: 'XLor' },
      description: 'for test usage',
      source: 'imagine'
    });

    epub.main().setIdentifier('test-book-id', 'BookId');

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
    const cover = new HTML('cover.xhtml', content);
    epub
      .item(cover)
      .spine(cover)
      .toc([{ title: 'cover', page: cover }]);

    await epub.writeFile('../../.output/test-core.epub');
  });

  it('generate toc', async () => {
    const epub = new Epub({
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
    epub.main().setIdentifier('12345', 'book-id');

    const item1 = new HTML('page1.xhtml', '1');
    const item2 = new HTML('page2.xhtml', '2');
    const item3 = new HTML('page3.xhtml', '3');
    const item4 = new HTML('page4.xhtml', '4');
    const item5 = new HTML('page5.xhtml', '5');

    await epub
      .item(item1, item2, item3, item4, item5)
      .spine(item1, item2, item3, item4, item5)
      .toc(
        [
          { title: '1', page: item1 },
          { title: '2', page: item2 },
          {
            title: 'Sub',
            list: [
              { title: '3', page: item3 },
              { title: '4', page: item4 }
            ]
          },
          { title: '5', page: item5 }
        ],
        {
          heading: 2,
          title: 'Toc'
        }
      )
      .bundle();

    expect(epub.main()).toMatchSnapshot();
  });
});
