import type { Prettify } from './utils';

import type { XHTMLBuilder } from './xhtml';
import type { Image, NavList, NavOption } from './epub';

export type PageTemplate<T = any> = (file: string, props: T) => XHTMLBuilder;

export interface Theme<P extends Record<string, PageTemplate<any>>> {
  name: string;

  styles: string[];

  images: string[];

  pages: Prettify<
    {
      cover(file: string, props: { image: Image; title?: string }): XHTMLBuilder;
      nav(file: string, props: { nav: NavList; option: Partial<NavOption> }): XHTMLBuilder;
    } & P
  >;
}
