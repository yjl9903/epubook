import { XHTMLBuilder, XHTMLNode } from './xhtml';

interface NavRoot {
  heading?: 1 | 2 | 3 | 4 | 5 | 6;

  title?: string;

  list: NavItem[];
}

interface SubNavItem {
  href?: string;

  text: string;
}

interface NavItem extends SubNavItem {
  list?: SubNavItem[];
}

export function buildTocNav(nav: NavRoot) {
  const builder = new XHTMLBuilder();

  const root = {
    tag: 'nav',
    attrs: {
      'epub:type': 'toc'
    },
    children: [] as XHTMLNode[]
  } satisfies XHTMLNode;

  if (nav.title && nav.heading) {
    root.children.push({
      tag: 'h' + nav.heading,
      attrs: {},
      children: nav.title
    });
  }
  root.children.push({
    tag: 'ol',
    attrs: {},
    children: list(nav.list)
  });

  return builder
    .title(nav.title ?? 'Toc')
    .body(root)
    .build();

  function list(items: Array<SubNavItem | NavItem>): XHTMLNode[] {
    return items.map((i) => ({
      tag: 'li',
      attrs: {},
      children: [
        i.href
          ? { tag: 'a', attrs: { href: i.href }, children: i.text }
          : { tag: 'span', attrs: {}, children: i.text },
        'list' in i &&
          i.list && {
            tag: 'ol',
            attrs: {},
            children: list(i.list)
          }
      ].filter(Boolean) as XHTMLNode[]
    }));
  }
}
