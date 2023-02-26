import { XHTMLBuilder, XHTMLNode, h } from '../bundle/xhtml';

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
    root.children.push(h('h' + nav.heading, {}, nav.title));
  }
  root.children.push(h('ol', {}, list(nav.list)));

  return builder.title(nav.title ?? 'Toc').body(root);

  function list(items: Array<SubNavItem | NavItem>): XHTMLNode[] {
    return items.map((i) => ({
      tag: 'li',
      attrs: {},
      children: [
        i.href ? h('a', { href: i.href }, i.text) : h('span', {}, i.text),
        'list' in i && i.list && h('ol', {}, list(i.list))
      ].filter(Boolean) as XHTMLNode[]
    }));
  }
}
