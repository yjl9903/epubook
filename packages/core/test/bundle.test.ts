import { describe, it, expect } from 'vitest';

import { Epubook } from '../src/epub';
import { makeContainer } from '../src/bundle';

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
});
