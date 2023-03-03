import type { Prettify } from './utils';

import { Image } from './epub';
import { XHTMLBuilder } from './xhtml';

export type PageTemplate<T = any> = (file: string, props: T) => XHTMLBuilder;

export interface Theme<P extends Record<string, PageTemplate<any>>> {
  name: string;

  styles: string[];

  images: string[];

  pages: Prettify<
    {
      cover(file: string, props: { image: Image }): XHTMLBuilder;
    } & P
  >;
}
