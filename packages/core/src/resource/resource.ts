import * as path from 'pathe';

import { strToU8 } from 'fflate';

import { XHTMLMeta } from '@epubook/xml';

import { Item, ItemRef } from '../epub/manifest.js';
import {
  type MediaType,
  type ImageMediaType,
  TextXHTML,
  TextCSS,
  Properties
} from '../constant.js';

export abstract class Resource {
  protected readonly _id: string;

  protected readonly _fullPath: string;

  protected _mediaType: MediaType;

  protected _properties?: Properties;

  public constructor(id: string | undefined, fullPath: string, mediaType: MediaType) {
    this._id = id || fullPath.replace(/\/|\\/g, '_').replace(/\.[\w]+$/, '');
    this._fullPath = fullPath;
    this._mediaType = mediaType;
  }

  public get id() {
    return this._id;
  }

  public get path() {
    return this._fullPath;
  }

  public relative(from: string) {
    return path.relative(path.dirname(from), this._fullPath);
  }

  public updateAttrs(info: Partial<{ mediaType: MediaType; properties: Properties }>) {
    if (info.mediaType) {
      this._mediaType = info.mediaType;
    }
    if (info.properties) {
      this._properties = info.properties;
    }
    return this;
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
  private _content: string;

  public constructor(fullPath: string, content: string = '', options: { id?: string } = {}) {
    super(options.id, fullPath, TextCSS);
    this._content = content;
  }

  public update(content: string) {
    this._content = content;
    return this;
  }

  public async bundle(): Promise<Uint8Array> {
    // TODO: check encode format
    return strToU8(this._content);
  }
}

export class Image extends Resource {
  private _data: Uint8Array | undefined;

  public constructor(
    fullPath: string,
    type: ImageMediaType,
    data: Uint8Array | undefined = undefined,
    options: { id?: string } = {}
  ) {
    super(options.id, fullPath, type);
    this._mediaType = type;
    this._data = data;
  }

  public update(type: ImageMediaType, data: Uint8Array) {
    this._mediaType = type;
    this._data = data;
    return this;
  }

  public async bundle(): Promise<Uint8Array> {
    if (!this._data) return new Uint8Array(0);
    return this._data;
  }
}

export class Cover extends Image {
  public constructor(
    fullPath: string,
    type: ImageMediaType,
    data: Uint8Array | undefined = undefined,
    options: { id?: string } = {}
  ) {
    super(fullPath, type, data, options);
    this._properties = 'cover-image';
  }
}

export class XHTML extends Resource {
  private _meta: XHTMLMeta;

  private _content: string | undefined;

  public constructor(
    fullPath: string,
    meta: Partial<XHTMLMeta> = { title: '', language: 'en' },
    content: string | undefined = undefined,
    options: { id?: string } = {}
  ) {
    super(options.id, fullPath, TextXHTML);
    this._meta = { title: '', language: 'en', ...meta };
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

  public get content() {
    return this._content;
  }

  public update(text: string) {
    this._content = text;
    return this;
  }

  public async bundle(): Promise<Uint8Array> {
    // TODO: check encode format
    return strToU8(this._content || '');
  }
}
