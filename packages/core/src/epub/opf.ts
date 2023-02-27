import { randomUUID } from 'node:crypto';

import { createDefu } from 'defu';

import { buildTocNav } from './nav';
import { Html, Item, ManifestItemRef } from './item';

const defu = createDefu((obj: any, key, value: any) => {
  if (obj[key] instanceof Date && value instanceof Date) {
    obj[key] = value;
    return true;
  }
});

export interface PackageDocumentMeta {
  title: string;
  language: string;
  contributor: string[];
  coverage: string;
  creator: string;
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

  private _toc: Html | undefined;

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

  public setSpine(items: Item[]) {
    this._spine.splice(0, this._spine.length, ...items.map((i) => i.itemref()));
    return this;
  }

  public spine() {
    return this._spine;
  }

  // --- navigation ---
  public toc(nav: NavOption, title?: string) {
    const content = buildTocNav({
      heading: 2,
      title,
      list: nav.map((i) =>
        Array.isArray(i.item)
          ? { text: i.text, list: i.item.map((i) => ({ href: i.item.filename(), text: i.text })) }
          : { href: i.item.filename(), text: i.text }
      )
    })
      .language(this._metadata.language)
      .build();
    this._toc = new Html('nav.xhtml', content).update({ properties: 'nav' });
    return this;
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

export type NavOption = Array<{ text: string; item: Html | Array<{ text: string; item: Html }> }>;
