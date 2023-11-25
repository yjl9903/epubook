import * as path from 'pathe';

import { strToU8 } from 'fflate';

import {
  type MediaType,
  type ImageMediaType,
  TextXHTML,
  TextCSS,
  getImageMediaType
} from '../constant';

import { ManifestItem } from './manifest';
import { HTMLMeta } from '@epubook/xml';

export abstract class Item {
  private readonly file: string;

  private readonly mediaType: MediaType;

  private _properties?: string;

  constructor(file: string, mediaType: MediaType) {
    this.file = file;
    this.mediaType = mediaType;
  }

  public filename() {
    return this.file;
  }

  public relative(from: string) {
    return path.relative(path.dirname(from), this.file);
  }

  public update(info: Partial<{ properties: string }>) {
    if (info.properties) {
      this._properties = info.properties;
    }
    return this;
  }

  public id() {
    return this.file.replace(/\/|\\/g, '_').replace(/\.[\w]+$/, '');
  }

  public manifest() {
    return new ManifestItem(this.file, this.id()).update({
      mediaType: this.mediaType,
      properties: this._properties
    });
  }

  public itemref() {
    return this.manifest().ref();
  }

  abstract bundle(): Promise<Uint8Array>;
}

export class Style extends Item {
  private content: string;

  constructor(file: string, content: string) {
    super(file, TextCSS);
    this.content = content;
  }

  async bundle(): Promise<Uint8Array> {
    // TODO: check encode format
    return strToU8(this.content);
  }
}

export class Image extends Item {
  private data: Uint8Array;

  constructor(file: string, type: ImageMediaType, data: Uint8Array) {
    super(file, type);
    this.data = data;
  }

  async bundle(): Promise<Uint8Array> {
    return this.data;
  }
}

export class HTML extends Item {
  private content: string;

  constructor(file: string, content: string) {
    super(file, TextXHTML);
    this.content = content;
  }

  async bundle(): Promise<Uint8Array> {
    // TODO: check encode format
    return strToU8(this.content);
  }
}

export class XHTML extends Item {
  private _meta: HTMLMeta;

  private _content: string;

  public constructor(file: string, meta: HTMLMeta, content: string) {
    super(file, TextXHTML);
    this._meta = meta;
    this._content = content;
  }

  public meta() {
    return this._meta;
  }

  public title() {
    return this._meta.title;
  }

  public language() {
    return this._meta.language;
  }

  public content() {
    return this._content;
  }

  public async bundle(): Promise<Uint8Array> {
    // TODO: check encode format
    return strToU8(this._content);
  }
}
