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
  private container: Epub;

  private option: Omit<EpubookOption, 'theme'>;

  private theme!: Theme<P>;

  private content: Array<XHTML> = [];

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

    this.container = new Epub(this.option);
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
      this.container.item(image);
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
      const page = this.page('cover', { image }, { file: `cover.xhtml` });
      this.content.unshift(page);
      return image;
    } else {
      return undefined;
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
    this.container.item(xhtml);
    return xhtml;
  }

  public toc() {
    return this;
  }

  public spine() {
    return this;
  }

  private async preBundle() {
    this.container.toc(this.content.map((c) => ({ title: c.title(), page: c })));
    this.container.spine(...this.content);
  }

  public async bundle() {
    this.preBundle();
    return this.container.bundle();
  }

  public async writeFile(file: string) {
    this.preBundle();
    return this.container.writeFile(file);
  }
}
