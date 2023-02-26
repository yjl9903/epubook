import { describe, it, expect } from 'vitest';

import { Epubook } from '../src';
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

    const res = makePackageDocument(opf);
    console.log(res);
  });
});
