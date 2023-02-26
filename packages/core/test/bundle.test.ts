import { Html } from './../src/epub/item';
import { describe, it, expect } from 'vitest';

import { Epub } from '../src';
import { makeContainer, makePackageDocument } from '../src/bundle';
import { buildTocNav } from '../src/epub/nav';
import { XHTMLBuilder } from '../src/epub/xhtml';

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
      creator: 'XLor',
      description: 'for test usage',
      source: 'imagine'
    });

    const cover = new Html('cover.xhtml', '');
    opf.addItem(cover);
    opf.spine().push(cover.manifest().ref());

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
      creator: 'XLor',
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
    const cover = new Html('cover.xhtml', content);
    epub.addItem(cover).toc([{ text: 'cover', item: cover }]);
    epub.main().spine().push(cover.itemref());

    await epub.writeFile('.output/test.epub');
  });

  it('generate toc', async () => {
    const epub = new Epub({
      title: 'Test Book',
      date: new Date('2023-02-01T11:00:00.000Z'),
      lastModified: new Date('2023-02-26T11:00:00.000Z'),
      creator: 'XLor',
      description: 'for test usage',
      source: 'imagine'
    });
    epub.main().setIdentifier('12345', 'book-id');

    const item1 = new Html('page1.xhtml', '1');
    const item2 = new Html('page2.xhtml', '2');
    const item3 = new Html('page3.xhtml', '3');
    const item4 = new Html('page4.xhtml', '4');
    const item5 = new Html('page5.xhtml', '5');

    await epub
      .addItem(item1, item2, item3, item4, item5)
      .toc(
        [
          { text: '1', item: item1 },
          { text: '2', item: item2 },
          {
            text: 'Sub',
            item: [
              { text: '3', item: item3 },
              { text: '4', item: item4 }
            ]
          },
          { text: '5', item: item5 }
        ],
        'Toc'
      )
      .bundle();

    expect(epub.main()).toMatchSnapshot();
  });
});

describe('XHTML Builder', () => {
  it('should build empty', () => {
    const builder = new XHTMLBuilder();
    const res = builder.build();
    expect(res).toMatchInlineSnapshot(`
      "<html xmlns=\\"http://www.w3.org/1999/xhtml\\" xmlns:epub=\\"http://www.idpf.org/2007/ops\\" lang=\\"en\\" xml:lang=\\"en\\">
        <head>
          <title></title>
        </head>
        <body></body>
      </html>
      "
    `);
  });

  it('should build styles', () => {
    const builder = new XHTMLBuilder();
    const res = builder.title('with style').style('123').style('456').build();
    expect(res).toMatchInlineSnapshot(`
      "<html xmlns=\\"http://www.w3.org/1999/xhtml\\" xmlns:epub=\\"http://www.idpf.org/2007/ops\\" lang=\\"en\\" xml:lang=\\"en\\">
        <head>
          <title>with style</title>
          <link href=\\"123\\" rel=\\"stylesheet\\" type=\\"text/css\\"/>
          <link href=\\"456\\" rel=\\"stylesheet\\" type=\\"text/css\\"/>
        </head>
        <body></body>
      </html>
      "
    `);
  });

  it('should build nav toc', () => {
    const res = buildTocNav({
      heading: 1,
      title: 'Hello',
      list: [
        { href: '1', text: 'page 1' },
        { href: '2', text: 'page 2' },
        { text: 'page 3', list: [{ href: '4', text: 'page 4' }] }
      ]
    });
    expect(res).toMatchInlineSnapshot(`
      "<html xmlns=\\"http://www.w3.org/1999/xhtml\\" xmlns:epub=\\"http://www.idpf.org/2007/ops\\" lang=\\"en\\" xml:lang=\\"en\\">
        <head>
          <title>Hello</title>
        </head>
        <body>
          <nav epub:type=\\"toc\\">
            <h1>Hello</h1>
            <ol>
              <li>
                <a href=\\"1\\">page 1</a>
              </li>
              <li>
                <a href=\\"2\\">page 2</a>
              </li>
              <li>
                <span>page 3</span>
                <ol>
                  <li>
                    <a href=\\"4\\">page 4</a>
                  </li>
                </ol>
              </li>
            </ol>
          </nav>
        </body>
      </html>
      "
    `);
  });
});
