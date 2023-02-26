import * as path from 'node:path';
import { existsSync, mkdirSync, promises as fs } from 'node:fs';

import { PackageDocument } from './opf';

export class Epubook {
  /**
   * See: https://www.w3.org/TR/epub-33/#sec-package-doc
   *
   * Now, it only supports single opf (OEBPS/content.opf)
   *
   * @returns list of package documents
   */
  private opfs: PackageDocument[] = [new PackageDocument('OEBPS/content.opf')];

  constructor() {}

  public packageDocuments(): PackageDocument[] {
    return this.opfs;
  }

  public mainPackageDocument() {
    return this.opfs[0];
  }

  async bundle() {
    const { bundle } = await import('../bundle');
    return await bundle(this);
  }

  async writeFile(file: string) {
    const buffer = await this.bundle();
    const dir = path.dirname(file);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    await fs.writeFile(file, buffer);
  }
}
