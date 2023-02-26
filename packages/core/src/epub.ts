import { randomUUID } from 'node:crypto';
import { type PathLike, promises as fs } from 'node:fs';

import { createDefu } from 'defu';

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
    const { bundle } = await import('./bundle');
    return await bundle(this);
  }

  async writeFile(file: PathLike) {
    const buffer = await this.bundle();
    await fs.writeFile(file, buffer);
  }
}

const defu = createDefu((obj: any, key, value: any) => {
  if (obj[key] instanceof Date && value instanceof Date) {
    obj[key] = value;
    return true;
  }
});

export class PackageDocument {
  private readonly file: string;

  private readonly SpecVersion: '3.0' = '3.0';

  private _uniqueIdentifier = 'uuid';

  private _identifier = randomUUID();

  private _metadata = {
    title: '',
    language: 'zh-CN',
    contributor: [] as string[],
    coverage: '',
    creator: 'unknown',
    date: new Date(),
    description: '',
    format: '',
    publisher: '',
    relation: '',
    rights: '',
    source: '',
    subject: '',
    type: '',
    lastModified: new Date()
  };

  constructor(file: string) {
    this.file = file;
  }

  public filename() {
    return this.file;
  }

  public version() {
    return this.SpecVersion;
  }

  // --- metadata ---
  public update(info: Partial<typeof this._metadata>) {
    // TODO: valiate input data
    this._metadata = defu(info, this._metadata);
    return this;
  }

  public title() {
    return this._metadata.title;
  }

  public language() {
    return this._metadata.language;
  }

  public creator() {
    return this._metadata.creator;
  }

  public metadata() {
    return this._metadata;
  }

  // --- identifier ---
  public uniqueIdentifier() {
    return this._uniqueIdentifier;
  }

  public identifier() {
    return this._identifier;
  }

  public setIdentifier(identifier: string, uniqueIdentifier: string) {
    this._identifier = identifier;
    this._uniqueIdentifier = uniqueIdentifier;
  }
}
