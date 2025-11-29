import * as path from 'pathe';

import { strToU8 } from 'fflate';

import { HTMLMeta } from '@epubook/xml';

import { type MediaType, type ImageMediaType, TextXHTML, TextCSS } from '../constant';

import { Item, ItemRef } from './manifest';

export abstract class Resource {
  private readonly _fullPath: string;

  private readonly _mediaType: MediaType;

  private _id: string;

  private _properties?: string;

  public constructor(fullPath: string, mediaType: MediaType) {
    this._fullPath = fullPath;
    this._id = fullPath.replace(/\/|\\/g, '_').replace(/\.[\w]+$/, '');
    this._mediaType = mediaType;
  }

  public get path() {
    return this._fullPath;
  }

  public relative(from: string) {
    return path.relative(path.dirname(from), this._fullPath);
  }

  public update(info: Partial<{ properties: string }>) {
    if (info.properties) {
      this._properties = info.properties;
    }
    return this;
  }

  public get id() {
    return this._id;
  }

  public item() {
    return new Item(this._fullPath, this._id).update({
      mediaType: this._mediaType,
      properties: this._properties
    });
  }

  public itemref() {
    return new ItemRef(this._id);
  }

  abstract bundle(): Promise<Uint8Array>;
}

export class StyleSheet extends Resource {
  private content: string;

  public constructor(file: string, content: string) {
    super(file, TextCSS);
    this.content = content;
  }

  public async bundle(): Promise<Uint8Array> {
    // TODO: check encode format
    return strToU8(this.content);
  }
}

export class Image extends Resource {
  private data: Uint8Array;

  public constructor(file: string, type: ImageMediaType, data: Uint8Array) {
    super(file, type);
    this.data = data;
  }

  public async bundle(): Promise<Uint8Array> {
    return this.data;
  }
}

export class Xhtml extends Resource {
  private _meta: HTMLMeta;

  private _content: string;

  public constructor(file: string, meta: HTMLMeta, content: string) {
    super(file, TextXHTML);
    this._meta = meta;
    this._content = content;
  }

  public get meta() {
    return this._meta;
  }

  public get title() {
    return this._meta.title;
  }

  public get language() {
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
