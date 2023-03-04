import {
  type Theme,
  type Author,
  type PageTemplate,
  type ImageMediaType,
  Epub,
  XHTML,
  Image,
  ImageExtension
} from '@epubook/core';

import type { DefaultTheme } from '@epubook/theme-default';

import * as path from 'node:path';

import { Cover } from './pages';
import { EpubookError } from './error';

export interface EpubookOption<T extends Theme<{}> = Awaited<ReturnType<typeof DefaultTheme>>> {
  title: string;

  description: string;

  language: string;

  author: Author[];

  theme: T;
}

const TextDir = 'text';
const ImageDir = 'images';

export class Epubook<P extends Record<string, PageTemplate> = {}> {
  private option: Omit<EpubookOption, 'theme'>;

  private theme!: Theme<P>;

  private _container: Epub;

  private _toc: XHTML | undefined;

  private _cover: XHTML | undefined;

  private _pages: Array<XHTML> = [];

  private _spine: Array<XHTML> = [];

  private counter: Record<string, number> = {
    image: 1
  };

  private constructor(option: Partial<EpubookOption>) {
    this.option = {
      title: 'unknown',
      description: 'unknown',
      language: 'zh-CN',
      author: [{ name: 'unknown' }],
      ...option
    };

    this._container = new Epub(this.option);
  }

  public static async create<P extends Record<string, PageTemplate> = {}>(
    option: Partial<EpubookOption<Theme<P>>>
  ): Promise<Epubook<P>> {
    const epubook = new Epubook<P>(option);
    await epubook.loadTheme(option.theme);
    return epubook;
  }

  private async loadTheme(theme?: Theme<P>) {
    if (theme) {
      this.theme = theme as Theme<P>;
    } else {
      const { DefaultTheme } = await import('@epubook/theme-default');
      this.theme = (await DefaultTheme()) as Theme<P>;
    }
    return this;
  }

  public epub() {
    return this._container;
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
      this._container.item(image);
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
    this.counter.image++;
    return image;
  }

  public async cover(img: string): Promise<Cover>;
  public async cover(img: Uint8Array, ext: ImageExtension): Promise<Cover>;
  public async cover(img: string | Uint8Array, ext?: ImageExtension): Promise<Cover> {
    if (typeof img === 'string') {
      ext = path.extname(img).slice(1) as ImageExtension;
    }
    const image =
      typeof img === 'string'
        ? await this.loadImage(`${ImageDir}/cover.${ext}`, img)
        : await this.loadImage(`${ImageDir}/cover.${ext}`, ext!);
    if (image) {
      image.update({ properties: 'cover-image' });
      const page = this.page('cover', { image }, { file: `cover.xhtml` });
      this._cover = page;
      this._pages.unshift(page);
      return Cover.from(image, page);
    } else {
      throw new EpubookError('Can not load image');
    }
  }

  public page<T extends string & keyof Theme<P>['pages']>(
    template: T,
    props: Parameters<Theme<P>['pages'][T]>[1],
    option: { file?: string } = {}
  ) {
    const render: Theme<P>['pages'][T] = this.theme.pages[template];
    const file = option.file ?? `${TextDir}/${template}-${this.counter[template] ?? 1}.xhtml`;
    const builder = render(file, props);
    const xhtml = builder.build();
    if (!this.counter[template]) {
      this.counter[template] = 2;
    } else {
      this.counter[template]++;
    }
    this._container.item(xhtml);
    return xhtml;
  }

  public toc(...items: Array<XHTML | { title: string; list: XHTML[] }>) {
    this._container.toc(
      items.map((i) =>
        i instanceof XHTML
          ? { title: i.title(), page: i }
          : { title: i.title, list: i.list.map((i) => ({ title: i.title(), page: i })) }
      )
    );

    const spine = items.flatMap((i) => (i instanceof XHTML ? [i] : i.list));
    this.spine(...spine);
  }

  public spine(...items: Array<XHTML>) {
    this._spine.splice(0, this._spine.length, ...items);
    this._container.spine(...this._spine);
    return this;
  }

  public async bundle() {
    return this._container.bundle();
  }

  public async writeFile(file: string) {
    return this._container.writeFile(file);
  }
}
