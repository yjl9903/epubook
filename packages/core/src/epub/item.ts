import * as path from 'node:path';
import { type PathLike, promises as fs } from 'node:fs';

import { strToU8 } from 'fflate';

import {
  type MediaType,
  type ImageMediaType,
  XHTML,
  ImageJpeg,
  ImagePng,
  ImageWebp
} from '../constant';

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

  public ref() {
    return new ManifestItemRef(this._id);
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

export abstract class Item {
  private readonly file: string;

  private readonly mediaType: MediaType;

  constructor(file: string, mediaType: MediaType) {
    this.file = file;
    this.mediaType = mediaType;
  }

  public filename() {
    return this.file;
  }

  public id() {
    return this.file.replace(/\/|\\/g, '_').replace(/\.[\w]+$/, '');
  }

  public manifest() {
    return new ManifestItem(this.file, this.id()).update({ mediaType: this.mediaType });
  }

  public itemref() {
    return this.manifest().ref();
  }

  abstract bundle(): Promise<Uint8Array>;
}

export class Html extends Item {
  private content: string;

  constructor(file: string, content: string) {
    super(file, XHTML);
    this.content = content;
  }

  static async read(src: PathLike, dst: string) {
    // TODO: check src extension
    const content = await fs.readFile(src, 'utf-8');
    return new Html(dst, content);
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

  static async read(src: string, dst: string) {
    const content = await fs.readFile(src);
    const media = this.getExtMediaType(src);
    if (media) {
      return new Image(dst, media, content);
    } else {
      return undefined;
    }
  }

  async bundle(): Promise<Uint8Array> {
    return this.data;
  }

  private static getExtMediaType(file: string): ImageMediaType | undefined {
    const ext = path.extname(file);
    if (ext === 'jpg' || ext === 'jpeg') {
      return ImageJpeg;
    } else if (ext === 'png') {
      return ImagePng;
    } else if (ext === 'webp') {
      return ImageWebp;
    } else {
      return undefined;
    }
  }
}
