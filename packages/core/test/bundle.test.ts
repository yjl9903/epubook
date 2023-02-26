import { describe, it, expect } from 'vitest';

import { Epubook, ManifestItem, ManifestItemRef } from '../src';
import { makeContainer, makePackageDocument } from '../src/bundle';

describe('Bundle Epub', () => {
  it('generate container.xml', () => {
    const res = makeContainer(new Epubook());
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
    const epub = new Epubook();

    const opf = epub.mainPackageDocument();
    opf.setIdentifier('test-book-id', 'BookId');
    opf.update({
      title: 'Test Book',
      date: new Date('2023-02-01T11:00:00.000Z'),
      lastModified: new Date('2023-02-26T11:00:00.000Z'),
      creator: 'XLor',
      description: 'for test usage',
      source: 'imagine'
    });

    opf
      .manifest()
      .push(
        new ManifestItem('Text/cover.xhtml', 'cover.xhtml').update({ properties: 'cover-image' })
      );
    opf.spine().push(new ManifestItemRef('cover.xhtml'));

    const res = makePackageDocument(opf);
    expect(res).toMatchInlineSnapshot(`
      "<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?>
      <package unique-identifier=\\"BookId\\" version=\\"3.0\\">
        <metadata>
          <dc:identifier>test-book-id</dc:identifier>
          <dc:title>Test Book</dc:title>
          <dc:language>zh-CN</dc:language>
          <dc:creator id=\\"creator\\" opf:role=\\"aut\\" opf:file-as=\\"XLor\\">XLor</dc:creator>
          <dc:date>2023-02-01T11:00:00.000Z</dc:date>
          <dc:description>for test usage</dc:description>
          <dc:source>imagine</dc:source>
          <meta property=\\"dcterms:modified\\">2023-02-26T11:00:00.000Z</meta>
          <meta refines=\\"#creator\\" property=\\"file-as\\">XLor</meta>
        </metadata>
        <manifest>
          <item href=\\"Text/cover.xhtml\\" id=\\"cover.xhtml\\" properties=\\"cover-image\\"/>
        </manifest>
        <spine>
          <itemref idref=\\"cover.xhtml\\"/>
        </spine>
      </package>
      "
    `);
  });
});
