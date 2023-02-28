import { XMLBuilder } from 'fast-xml-parser';

import { TextCSS } from '../constant';

import type { XHTMLNode } from './types';

export * from './types';

const builder = new XMLBuilder({
  format: true,
  ignoreAttributes: false,
  suppressUnpairedNode: false,
  unpairedTags: ['link']
});

export class XHTMLBuilder {
  private info = {
    language: 'en',
    title: ''
  };

  private _head: XHTMLNode[] = [];

  private _body: XHTMLNode[] = [];

  constructor() {}

  language(value: string) {
    this.info.language = value;
    return this;
  }

  title(value: string) {
    this.info.title = value;
    return this;
  }

  style(href: string) {
    this._head.push({
      tag: 'link',
      attrs: {
        href,
        rel: 'stylesheet',
        type: TextCSS
      },
      children: ['']
    });
    return this;
  }

  body(node: XHTMLNode) {
    this._body.push(node);
    return this;
  }

  public build(): string {
    function build(node: XHTMLNode) {
      const attrs = Object.fromEntries(
        Object.entries(node.attrs ?? {}).map(([key, value]) => ['@_' + key, value])
      );

      const obj: any = {
        ...attrs
      };

      if (Array.isArray(node.children)) {
        const text = node.children.filter((c): c is string => typeof c === 'string');
        const nodes = node.children.filter((c): c is XHTMLNode => typeof c !== 'string');
        if (text.length > 0) {
          obj['#text'] = text[0];
        }
        Object.assign(obj, list(nodes));
      }

      return obj;
    }

    function list(nodes: XHTMLNode[]) {
      const obj: any = {};
      for (const c of nodes) {
        if (c.tag in obj) {
          obj[c.tag].push(build(c));
        } else {
          obj[c.tag] = [build(c)];
        }
      }
      return obj;
    }

    return builder.build({
      html: {
        '@_xmlns': 'http://www.w3.org/1999/xhtml',
        '@_xmlns:epub': 'http://www.idpf.org/2007/ops',
        '@_lang': this.info.language,
        '@_xml:lang': this.info.language,
        head: {
          title: this.info.title,
          ...list(this._head)
        },
        body: list(this._body)
      }
    });
  }
}

export const Fragment = 'Fragment';

export function h(
  tag: string,
  attrs: Record<string, string> = {},
  ...children: Array<string | XHTMLNode | Array<string | XHTMLNode>>
) {
  const sub = children
    .flatMap((c) =>
      typeof c === 'object' && !Array.isArray(c) && c.tag === Fragment ? c.children ?? [] : c
    )
    .filter((c: any) => c !== undefined && c !== null && c !== false);

  const o = {
    tag,
    attrs: attrs ?? {},
    children: sub
  } satisfies XHTMLNode;

  return o;
}
