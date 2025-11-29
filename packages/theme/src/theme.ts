import type { XHTMLBuilder } from '@epubook/xml';

import type { Image } from '@epubook/core';

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type PageTemplate<T = any> = (file: string, props: T) => XHTMLBuilder;

export interface Theme<P extends Record<string, PageTemplate<any>>> {
  name: string;

  styles: string[];

  images: string[];

  pages: Prettify<
    {
      cover(file: string, props: { image: Image; title?: string }): XHTMLBuilder;
      // nav(file: string, props: { nav: NavList; option: Partial<NavOption> }): XHTMLBuilder;
    } & P
  >;
}
