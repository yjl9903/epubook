import { randomUUID } from 'node:crypto';

import { createDefu } from 'defu';

import { Item } from './item';
import { ManifestItemRef } from './manifest';
import { type NavList, type NavOption, Toc } from './nav';

const defu = createDefu((obj: any, key, value: any) => {
  if (obj[key] instanceof Date && value instanceof Date) {
    obj[key] = value;
    return true;
  }
});

export interface Author {
  name: string;

  fileAs?: string;

  role?: string;

  uid?: string;
}

export interface PackageDocumentMeta {
  title: string;
  language: string;
  contributor: Author[];
  coverage: string;
  creator: Author;
  date: Date;
  description: string;
  format: string;
  publisher: string;
  relation: string;
  rights: string;
  source: string;
  subject: string;
  type: string;
  lastModified: Date;
}

export class PackageDocument {
  private readonly file: string;

  private readonly SpecVersion: '3.0' = '3.0';

  private _uniqueIdentifier = 'uuid';

  private _identifier = randomUUID();

  private _metadata: PackageDocumentMeta = {
    title: '',
    language: 'zh-CN',
    contributor: [],
    coverage: '',
    creator: {
      name: 'unknown',
      uid: 'creator'
    },
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

  private _toc: Toc | undefined;

  private _items: Item[] = [];

  private _spine: ManifestItemRef[] = [];

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
  public update(info: Partial<PackageDocumentMeta>) {
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

  // --- manifest ---
  public addItem(item: Item) {
    this._items.push(item);
    return this;
  }

  public items() {
    const l = [...this._items];
    if (this._toc) {
      l.push(this._toc);
    }
    return l;
  }

  public manifest() {
    return this.items().map((i) => i.manifest());
  }

  // --- navigation ---
  public spine() {
    return this._spine;
  }

  public setSpine(items: Item[]) {
    this._spine.splice(0, this._spine.length, ...items.map((i) => i.itemref()));
    return this;
  }

  public toc() {
    return this._toc;
  }

  public setToc(nav: NavList, option: Partial<NavOption> = {}) {
    const toc = Toc.generate('nav.xhtml', nav, option)
      .title(option.title ?? 'Nav')
      .language(this._metadata.language);
    this._toc = Toc.from(toc.build());
    return this;
  }

  // --- identifier ---
  public uniqueIdentifier() {
    return this._uniqueIdentifier;
  }

  public identifier() {
    return this._identifier;
  }

  public setIdentifier(identifier: string, uniqueIdentifier: string = 'uuid') {
    this._identifier = identifier;
    this._uniqueIdentifier = uniqueIdentifier;
  }
}
