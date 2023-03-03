import * as path from 'pathe';
import { promises as fs } from 'node:fs';

import { strToU8 } from 'fflate';

import {
  type MediaType,
  type ImageMediaType,
  TextXHTML,
  TextCSS,
  getImageMediaType
} from '../constant';

import { ManifestItem } from './manifest';

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

  static async read(src: string, dst: string) {
    if (!src.endsWith('.css')) {
      return undefined;
    }
    const content = await fs.readFile(src, 'utf-8');
    return new Style(dst, content);
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

  static async read(file: string, src: string) {
    const content = await fs.readFile(src);
    const media = getImageMediaType(src);
    if (media) {
      return new Image(file, media, content);
    } else {
      return undefined;
    }
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

  static async read(src: string, dst: string) {
    if (!src.endsWith('.xhtml')) {
      return undefined;
    }
    const content = await fs.readFile(src, 'utf-8');
    return new HTML(dst, content);
  }

  async bundle(): Promise<Uint8Array> {
    // TODO: check encode format
    return strToU8(this.content);
  }
}
