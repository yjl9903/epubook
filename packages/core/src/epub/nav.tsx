import type { Prettify } from '../types';

import { XHTMLBuilder, HTMLMeta, XHTMLNode } from '@epubook/xml';

import { HTML, XHTML } from './item';

type NavItem = { title: string; attrs?: Record<string, string> };

type NavLink = Prettify<NavItem & { page: HTML | XHTML }>;

type NavSubList = Prettify<NavItem & { list: NavLink[] }>;

export type NavList = Array<NavLink | NavSubList>;

export interface NavOption {
  title: string;
  heading: 1 | 2 | 3 | 4 | 5 | 6;
  titleAttrs: Record<string, string>;
  builder?: XHTMLBuilder;
}

export class Toc extends XHTML {
  constructor(file: string, meta: HTMLMeta, content: string) {
    super(file, meta, content);
    this.update({ properties: 'nav' });
  }

  public static from(xhtml: XHTML) {
    return new Toc(xhtml.filename(), xhtml.meta(), xhtml.content());
  }

  public static generate(
    file: string,
    nav: NavList,
    { title = 'Nav', heading = 1, titleAttrs = {}, builder }: Partial<NavOption> = {}
  ) {
    if (!builder) {
      builder = new XHTMLBuilder(file);
    }

    const root = {
      tag: 'nav',
      attrs: {
        'epub:type': 'toc'
      },
      children: [] as XHTMLNode[]
    } satisfies XHTMLNode;

    const Head = `h${heading}`;
    root.children.push(<Head {...titleAttrs}>{title}</Head>);
    root.children.push(<ol>{list(nav)}</ol>);

    return builder.body(root);

    function list(items: Array<NavLink | NavSubList>): XHTMLNode[] {
      return items.map((i) =>
        'page' in i ? (
          <li {...i.attrs}>
            <a href={i.page.filename()}>{i.title}</a>
          </li>
        ) : 'list' in i ? (
          <li {...i.attrs}>
            <span>{i.title}</span>
            <ol>{list(i.list)}</ol>
          </li>
        ) : (
          false
        )
      );
    }
  }
}
