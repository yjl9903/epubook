import { type Author, type Theme, Epub } from '@epubook/core';

import { loadTheme } from './theme';

export interface EpubookOption {
  title: string;

  language: string;

  author: Author[];

  theme: string;
}

export class Epubook {
  private container: Epub;

  private option: EpubookOption;

  private theme!: Theme;

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

  public setCover() {
    return this;
  }

  public addPage() {
    return this;
  }

  public setToc() {
    return this;
  }

  public setSpine() {
    return this;
  }
}
