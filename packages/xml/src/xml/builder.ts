import * as path from 'pathe';
import { toXml } from 'xast-util-to-xml';
import { ElementContent } from 'xast';

import { normalizeChildren } from '../jsx/runtime.js';

export interface XHTMLMeta {
  title: string;
  language: string;
}

export class XHTMLBuilder {
  private _meta: XHTMLMeta = {
    language: 'en',
    title: ''
  };

  private _filename: string;

  private _head: ElementContent[] = [];

  private _body: ElementContent[] = [];

  private _bodyAttrs: Record<string, string> = {};

  public constructor(filename: string) {
    this._filename = filename;
    this._meta.title = path.basename(filename);
  }

  public get language() {
    return this._meta.language;
  }

  public setLanguage(value: string) {
    this._meta.language = value;
    return this;
  }

  public get title() {
    return this._meta.title;
  }

  public setTitle(value: string) {
    this._meta.title = value;
    return this;
  }

  public appendStyleSheet(...list: string[]) {
    for (const href of list) {
      this._head.push({
        type: 'element',
        name: 'link',
        attributes: {
          href,
          rel: 'stylesheet',
          type: 'text/css'
        },
        children: []
      });
    }
    return this;
  }

  public appendHead(...node: ElementContent[]) {
    this._head.push(...node);
    return this;
  }

  public appendBody(...node: ElementContent[]) {
    this._body.push(...node);
    return this;
  }

  public updateBodyAttrs(attrs: Record<string, string> = {}) {
    this._bodyAttrs = {
      ...this._bodyAttrs,
      ...attrs
    };
    return this;
  }

  public build() {
    const content = toXml(
      {
        type: 'root',
        data: {},
        children: [
          {
            type: 'element',
            name: 'html',
            attributes: {
              xmlns: 'http://www.w3.org/1999/xhtml',
              'xmlns:epub': 'http://www.idpf.org/2007/ops',
              lang: this._meta.language,
              'xml:lang': this._meta.language
            },
            children: [
              {
                type: 'element',
                name: 'head',
                attributes: {},
                children: normalizeChildren([...this._head])
              },
              {
                type: 'element',
                name: 'body',
                attributes: {},
                children: normalizeChildren([...this._body])
              }
            ]
          }
        ]
      },
      {
        closeEmptyElements: true
      }
    );

    return {
      filename: this._filename,
      meta: this._meta,
      content
    };
  }
}
