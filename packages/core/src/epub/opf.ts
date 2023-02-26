import { randomUUID } from 'node:crypto';

import { createDefu } from 'defu';

import type { MediaType } from '../bundle/constant';

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

export class ManifestItem {
  private _href: string;

  private _id: string;

  private optional: {
    fallback?: string;
    mediaOverlay?: string;
    mediaType?: MediaType;
    properties?: string;
  } = {};

  constructor(href: string, id: string) {
    this._href = href;
    this._id = id;
  }

  public update(info: typeof this.optional) {
    for (const [key, value] of Object.entries(info)) {
      if (!!value) {
        this.optional[key as keyof typeof this.optional] = value as any;
      }
    }
    return this;
  }

  public href() {
    return this._href;
  }

  public id() {
    return this._id;
  }

  public fallback() {
    return this.optional.fallback;
  }

  public mediaOverlay() {
    return this.optional.mediaOverlay;
  }

  public mediaType() {
    return this.optional.mediaType;
  }

  public properties() {
    return this.optional.properties;
  }
}

export class ManifestItemRef {
  private _idref: string;

  private optional: {
    id?: string;

    linear?: string;

    properties?: string;
  } = {};

  constructor(idref: string) {
    this._idref = idref;
  }

  public update(info: typeof this.optional) {
    for (const [key, value] of Object.entries(info)) {
      if (!!value) {
        this.optional[key as keyof typeof this.optional] = value as any;
      }
    }
    return this;
  }

  public idref() {
    return this._idref;
  }

  public id() {
    return this.optional.id;
  }

  public linear() {
    return this.optional.linear;
  }

  public properties() {
    return this.optional.properties;
  }
}
