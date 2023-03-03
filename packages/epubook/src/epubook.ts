import {
  type Author,
  type Theme,
  type PageTemplate,
  type ImageMediaType,
  Html,
  Epub,
  Image,
  ImageExtension
} from '@epubook/core';

import * as path from 'node:path';

import { loadTheme } from './theme';

export interface EpubookOption {
  title: string;

  description: string;

  language: string;

  author: Author[];

  theme: string;
}

const TextDir = 'text';
const ImageDir = 'images';

export class Epubook<P extends Record<string, PageTemplate> = {}> {
  private container: Epub;

  private option: EpubookOption;

  private theme!: Theme<P>;

  private content: Html[] = [];

  private counter: Record<string, number> = {
    image: 1
  };

  private constructor(option: Partial<EpubookOption>) {
    this.option = {
      title: 'unknown',
      description: 'unknown',
      language: 'zh-CN',
      author: [{ name: 'unknown' }],
      theme: '@epubook/theme-default',
      ...option
    };

    this.container = new Epub(this.option);
  }

  public static async create<P extends Record<string, PageTemplate> = {}>(
    option: Partial<EpubookOption>
  ): Promise<Epubook<P>> {
    const epubook = new Epubook(option);
    return (await epubook.loadTheme()) as Epubook<P>;
  }

  private async loadTheme() {
    this.theme = (await loadTheme(this.option.theme)) as Theme<P>;
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
      const page = this.page('cover', { image }, { file: `${TextDir}/cover.xhtml` });
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
    const content = builder.build();
    if (!this.counter[template]) {
      this.counter[template] = 2;
    } else {
      this.counter[template]++;
    }
    const xhtml = new Html(file, content);
    this.container.addItem(xhtml);
    return xhtml;
  }

  public toc() {
    return this;
  }

  public spine() {
    return this;
  }

  private async preBundle() {
    this.container.toc(this.content.map((c) => ({ title: c.id(), page: c })));
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
