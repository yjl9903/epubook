import { strToU8 } from 'fflate';

import { type ElementContent, XHTMLBuilder } from '@epubook/xml';

import type { Prettify } from '../utils/types.js';

import { TextXHTML } from '../constant.js';

import { Resource } from './resource.js';

export type NavItem = { title: string; attrs?: Record<string, string> };

export type NavResourceLink = Prettify<NavItem & { resource: Resource }>;

export type NavStaticLink = Prettify<NavItem & { href: string }>;

export type NavLink = NavResourceLink | NavStaticLink;

export type NavSubList = Prettify<NavItem & { children: NavLink[] }>;

export type NavList = Array<NavLink | NavSubList>;

export interface NavOption {
  title?: string;

  heading?: {
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    attrs?: Record<string, string>;
    text?: string;
  };
}

export class Navigation extends Resource {
  private _nav: NavList = [];

  private _options: Partial<NavOption> = {};

  public constructor(
    fullPath: string = 'nav.xhtml',
    nav: NavList = [],
    options: Partial<NavOption> = {}
  ) {
    super(undefined, fullPath, TextXHTML);
    this._properties = 'nav';
    this.update(nav, options);
  }

  public update(nav: NavList, options: Partial<NavOption> = {}) {
    this._nav = nav;
    this._options = options;
    return this;
  }

  public generate() {
    const builder = new XHTMLBuilder(this._fullPath);

    if (this._options.title) {
      builder.setTitle(this._options.title);
    }

    const nav: ElementContent[] = [];
    if (this._options.heading?.text || this._options.title) {
      nav.push({
        type: 'element',
        name: `h${this._options.heading || 1}`,
        attributes: this._options.heading?.attrs || {},
        children: [
          {
            type: 'text',
            value: this._options.heading?.text || this._options.title!
          }
        ]
      });
    }

    const makeAnchorNode = (navItem: NavResourceLink | NavStaticLink): ElementContent => {
      if ('resource' in navItem) {
        return {
          type: 'element',
          name: 'li',
          attributes: navItem.attrs || {},
          children: [
            {
              type: 'element',
              name: 'a',
              attributes: {
                href: navItem.resource.path
              },
              children: [
                {
                  type: 'text',
                  value: navItem.title
                }
              ]
            }
          ]
        };
      } else {
        return {
          type: 'element',
          name: 'li',
          attributes: navItem.attrs || {},
          children: [
            {
              type: 'element',
              name: 'a',
              attributes: {
                href: navItem.href
              },
              children: [
                {
                  type: 'text',
                  value: navItem.title
                }
              ]
            }
          ]
        };
      }
    };

    for (const navItem of this._nav) {
      if ('children' in navItem) {
        nav.push({
          type: 'element',
          name: 'li',
          attributes: navItem.attrs || {},
          children: [
            {
              type: 'element',
              name: 'span',
              attributes: {},
              children: [
                {
                  type: 'text',
                  value: navItem.title
                }
              ]
            },
            {
              type: 'element',
              name: 'ol',
              attributes: {},
              children: navItem.children.map((subNavItem) => makeAnchorNode(subNavItem))
            }
          ]
        });
      } else {
        nav.push(makeAnchorNode(navItem));
      }
    }

    builder.appendBody({
      type: 'element',
      name: 'nav',
      attributes: {
        'epub:type': 'toc'
      },
      children: [
        {
          type: 'element',
          name: 'ol',
          attributes: {},
          children: nav
        }
      ]
    });

    return builder.build();
  }

  public async bundle(): Promise<Uint8Array> {
    const result = this.generate();
    return strToU8(result.content);
  }
}
