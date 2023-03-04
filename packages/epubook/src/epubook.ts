import { NavList, NavOption } from './../../core/src/epub/nav';
import {
  type Theme,
  type Author,
  type PageTemplate,
  type ImageExtension,
  type ImageMediaType,
  type PackageDocumentMeta,
  Toc,
  Epub,
  XHTML,
  Image,
  Style
} from '@epubook/core';

import type { DefaultTheme, DefaultThemePageTemplate } from '@epubook/theme-default';

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

export class Epubook<P extends Record<string, PageTemplate> = DefaultThemePageTemplate> {
  private theme!: Theme<P>;

  private _option: Omit<EpubookOption<Theme<P>>, 'theme'>;

  private _container: Epub;

  private _toc: Toc | undefined;

  private _cover: Cover | undefined;

  private _spine: Array<XHTML> = [];

  private _styles: Array<Style> = [];

  private counter: Record<string, number> = {
    image: 1
  };

  private constructor(option: Partial<EpubookOption<Theme<P>>>) {
    this._option = {
      title: 'unknown',
      description: 'unknown',
      language: 'zh-CN',
      author: [{ name: 'unknown' }],
      ...option
    };

    this._container = new Epub(this._option);
  }

  public static async create<P extends Record<string, PageTemplate> = DefaultThemePageTemplate>(
    option: Partial<EpubookOption<Theme<P>>>
  ): Promise<Epubook<P>> {
    const epubook = new Epubook<P>(option);
    await epubook.loadTheme(option.theme);
    return epubook;
  }

  private async loadTheme(theme?: Theme<P>) {
    if (theme) {
      this.theme = theme;
    } else {
      const { DefaultTheme } = await import('@epubook/theme-default');
      // @ts-ignore
      this.theme = (await DefaultTheme()) as Theme<P>;
    }
    this._styles =
      this.theme.styles.length === 1
        ? [new Style(`styles/style.css`, this.theme.styles[0])]
        : this.theme.styles.map((s, idx) => new Style(`styles/style-${idx}.css`, s));
    this._container.item(...this._styles);
    return this;
  }

  public epub() {
    return this._container;
  }

  public meta(info: Partial<PackageDocumentMeta>) {
    if (info.language) {
      this._option.language = info.language;
    }
    this._container.main().update(info);
    return this;
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
      const builder = this.pageBuilder('cover', { image }, { file: `cover.xhtml` });
      this._cover = Cover.from(image, builder.build());
      this._container.item(this._cover);
      return this._cover;
    } else {
      throw new EpubookError('Can not load image');
    }
  }

  /**
   * Do not forget adding the generate page to container
   *
   * @param template Use specify template to generate XHTML
   * @param props Generate props
   * @param option
   * @returns
   */
  private pageBuilder<T extends string & keyof Theme<P>['pages']>(
    template: T,
    props: Parameters<Theme<P>['pages'][T]>[1],
    option: { file?: string } = {}
  ) {
    const render: Theme<P>['pages'][T] = this.theme.pages[template];
    const file = option.file ?? `${TextDir}/${template}-${this.counter[template] ?? 1}.xhtml`;
    if (!option.file) {
      if (!this.counter[template]) {
        this.counter[template] = 2;
      } else {
        this.counter[template]++;
      }
    }
    return render(file, props)
      .style(...this._styles)
      .language(this._option.language);
  }

  public page<T extends string & keyof Theme<P>['pages']>(
    template: T,
    props: Parameters<Theme<P>['pages'][T]>[1]
  ) {
    const builder = this.pageBuilder(template, props);
    const xhtml = builder.build();
    this._container.item(xhtml);
    return xhtml;
  }

  // TODO: add toc page self to toc
  public toc(...items: Array<XHTML | { title: string; list: XHTML[] }>) {
    const nav: NavList = items.map((i) =>
      i instanceof XHTML
        ? { title: i.title(), page: i }
        : { title: i.title, list: i.list.map((i) => ({ title: i.title(), page: i })) }
    );

    const option: Partial<NavOption> = {};
    option.builder = this.pageBuilder('nav', { nav, option }, { file: 'nav.xhtml' });
    this._container.toc(nav, option);

    const spine = items.flatMap((i) => (i instanceof XHTML ? [i] : i.list));
    this.spine(...spine);

    return (this._toc = this._container.main().toc()!);
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
