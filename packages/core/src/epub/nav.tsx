import type { Prettify } from '../utils';

import { TextXHTML } from '../constant';
import { XHTMLBuilder, XHTMLNode, h, XHTML } from '../xhtml';

import { Item, HTML } from './item';

type NavItem = { title: string; attrs?: Record<string, string> };

type NavLink = Prettify<NavItem & { page: HTML | XHTML }>;

type NavSubList = Prettify<NavItem & { list: NavLink[] }>;

export type NavList = Array<NavLink | NavSubList>;

export interface NavOption {
  title: string;
  heading: 1 | 2 | 3 | 4 | 5 | 6;
  titleAttrs: Record<string, string>;
  head: XHTMLNode[];
  body: XHTMLNode[];
}

export class Toc extends Item {
  private _builder: XHTMLBuilder;

  constructor(file: string) {
    super(file, TextXHTML);
    this._builder = new XHTMLBuilder(this.filename());
    this.update({ properties: 'nav' });
  }

  public generate(
    nav: NavList,
    { title = 'Nav', heading = 1, titleAttrs = {}, head = [], body = [] }: Partial<NavOption> = {}
  ) {
    const builder = new XHTMLBuilder(this.filename());

    const root = {
      tag: 'nav',
      attrs: {
        'epub:type': 'toc'
      },
      children: [] as XHTMLNode[]
    } satisfies XHTMLNode;

    root.children.push(h('h' + heading, titleAttrs, title));
    root.children.push(<ol>{list(nav)}</ol>);

    builder
      .title(title)
      .body(root)
      .head(...head)
      .body(...body);

    return (this._builder = builder);

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

  public async bundle(): Promise<Uint8Array> {
    return this._builder.build().bundle();
  }
}
