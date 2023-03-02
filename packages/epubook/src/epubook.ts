import {
  type Author,
  type Theme,
  type ImageMediaType,
  Epub,
  Image,
  ImageExtension
} from '@epubook/core';

import * as path from 'node:path';

import { loadTheme } from './theme';

export interface EpubookOption {
  title: string;

  language: string;

  author: Author[];

  theme: string;
}

const ImageDir = 'images';

export class Epubook {
  private container: Epub;

  private option: EpubookOption;

  private theme!: Theme;

  private counter = {
    image: 0,
    page: 0
  };

  private constructor(option: Partial<EpubookOption>) {
    this.option = {
      title: '',
      language: 'zh-CN',
      author: [{ name: 'unknown' }],
      theme: '@epubook/theme-default',
      ...option
    };

    this.container = new Epub(this.option);
  }

  public static async create(option: Partial<EpubookOption>) {
    const epubook = new Epubook(option);
    return await epubook.loadTheme();
  }

  private async loadTheme() {
    await loadTheme(this.option.theme);
    return this;
  }

  public epub() {
    return this.container;
  }

  private async loadImage(
    file: string,
    img: string | Uint8Array,
    ext?: ImageMediaType
  ): Promise<Image | undefined> {
    let image: Image | undefined;
    if (typeof img === 'string') {
      ext = path.extname(img) as ImageMediaType;
      image = await Image.read(file, img);
    } else if (ext) {
      image = new Image(file, ext, img);
    }
    if (image) {
      this.container.addItem(image);
    }
    return image;
  }

  public async image(img: string): Promise<Image | undefined>;
  public async image(img: Uint8Array, ext: ImageExtension): Promise<Image | undefined>;
  public async image(img: string | Uint8Array, ext?: ImageExtension) {
    if (typeof img === 'string') {
      ext = path.extname(img).slice(1) as ImageExtension;
    }
    const image =
      typeof img === 'string'
        ? await this.loadImage(`${ImageDir}/image-${this.counter.image}.${ext}`, img)
        : await this.loadImage(`${ImageDir}/image-${this.counter.image}.${ext}`, ext!);
    return image;
  }

  public async cover(img: string): Promise<Image | undefined>;
  public async cover(img: Uint8Array, ext: ImageExtension): Promise<Image | undefined>;
  public async cover(img: string | Uint8Array, ext?: ImageExtension) {
    if (typeof img === 'string') {
      ext = path.extname(img).slice(1) as ImageExtension;
    }
    const image =
      typeof img === 'string'
        ? await this.loadImage(`${ImageDir}/cover.${ext}`, img)
        : await this.loadImage(`${ImageDir}/cover.${ext}`, ext!);
    if (image) {
      image.update({ properties: 'cover-image' });
      return image;
    } else {
      return undefined;
    }
  }

  public page() {
    return this;
  }

  public toc() {
    return this;
  }

  public spine() {
    return this;
  }

  public async bundle() {
    return this.container.bundle();
  }

  public async writeFile(file: string) {
    return this.container.writeFile(file);
  }
}
