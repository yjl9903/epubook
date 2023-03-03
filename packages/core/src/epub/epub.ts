import * as path from 'pathe';
import { existsSync, mkdirSync, promises as fs } from 'node:fs';

import type { NavList, NavOption } from './nav';

import { Item } from './item';
import { PackageDocument, PackageDocumentMeta } from './opf';

export class Epub {
  /**
   * See: https://www.w3.org/TR/epub-33/#sec-package-doc
   *
   * Now, it only supports single opf (OEBPS/content.opf)
   *
   * @returns list of package documents
   */
  private opfs: PackageDocument[] = [new PackageDocument('OEBPS/content.opf')];

  constructor(meta: Partial<PackageDocumentMeta> = {}) {
    this.opfs[0].update(meta);
  }

  public packages(): PackageDocument[] {
    return this.opfs;
  }

  public main() {
    return this.opfs[0];
  }

  public item(...items: Item[]) {
    for (const item of items) {
      this.opfs[0].addItem(item);
    }
    return this;
  }

  public toc(nav: NavList, option: Partial<NavOption> = {}) {
    this.opfs[0].setToc(nav, option);
    return this;
  }

  public spine(...items: Item[]) {
    this.opfs[0].setSpine(items);
    return this;
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
