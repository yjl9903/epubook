import { randomUUID } from 'node:crypto';

import { createDefu } from 'defu';

import { Item, ManifestItem, ManifestItemRef } from './item';

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

  private _items: Item[] = [];

  private _manifest: ManifestItem[] = [];

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

  // --- manifest ---
  public addItem(item: Item) {
    this._items.push(item);
    this._manifest.push(item.manifest());
  }

  public items() {
    return this._items;
  }

  public manifest() {
    return this._manifest;
  }

  public spine() {
    return this._spine;
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
