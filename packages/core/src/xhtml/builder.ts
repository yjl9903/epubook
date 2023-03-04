import * as path from 'pathe';
import { strToU8 } from 'fflate';
import { XMLBuilder } from 'fast-xml-parser';

import { Item, Style } from '../epub/item';
import { TextCSS, TextXHTML } from '../constant';

import type { XHTMLNode } from './types';

const builder = new XMLBuilder({
  format: true,
  ignoreAttributes: false,
  suppressUnpairedNode: false,
  unpairedTags: ['link']
});

export interface HTMLMeta {
  language: string;
  title: string;
}

export class XHTML extends Item {
  private _meta: HTMLMeta;

  private _content: string;

  public constructor(file: string, meta: HTMLMeta, content: string) {
    super(file, TextXHTML);
    this._meta = meta;
    this._content = content;
  }

  public meta() {
    return this._meta;
  }

  public title() {
    return this._meta.title;
  }

  public language() {
    return this._meta.language;
  }

  public content() {
    return this._content;
  }

  public async bundle(): Promise<Uint8Array> {
    // TODO: check encode format
    return strToU8(this._content);
  }
}

export class XHTMLBuilder {
  private _meta: HTMLMeta = {
    language: 'en',
    title: ''
  };

  private _filename: string;

  private _head: XHTMLNode[] = [];

  private _body: XHTMLNode[] = [];

  public constructor(filename: string) {
    this._filename = filename;
    this._meta.title = path.basename(filename);
  }

  public language(value: string) {
    this._meta.language = value;
    return this;
  }

  public title(value: string) {
    this._meta.title = value;
    return this;
  }

  public style(href: string | Style) {
    if (typeof href === 'string') {
      this._head.push({
        tag: 'link',
        attrs: {
          href,
          rel: 'stylesheet',
          type: TextCSS
        },
        children: ['']
      });
    } else {
      this._head.push({
        tag: 'link',
        attrs: {
          href: href.relative(this._filename),
          rel: 'stylesheet',
          type: TextCSS
        },
        children: ['']
      });
    }
    return this;
  }

  public head(...node: XHTMLNode[]) {
    this._head.push(...node);
    return this;
  }

  public body(...node: XHTMLNode[]) {
    this._body.push(...node);
    return this;
  }

  public build(): XHTML {
    const content = builder.build({
      html: {
        '@_xmlns': 'http://www.w3.org/1999/xhtml',
        '@_xmlns:epub': 'http://www.idpf.org/2007/ops',
        '@_lang': this._meta.language,
        '@_xml:lang': this._meta.language,
        head: {
          title: this._meta.title,
          ...list(this._head)
        },
        body: list(this._body)
      }
    });

    return new XHTML(this._filename, this._meta, content);

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
  }
}
