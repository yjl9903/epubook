import type { Node } from 'xast';

declare global {
  namespace JSX {
    interface IntrinsicElements extends HtmlIntrinsicElements {}
  }
}

export interface ContainerIntrinsicElements {
  containter: {
    version: string;
    xmlns: string;
  };

  rootfiles: {};

  rootfile: {
    fullPath: string;
    mediaType: string;
  };
}

export type XmlChild = Node | Node[] | string | number | boolean | null | undefined;

export type XmlChildren = XmlChild | XmlChild[];

export interface BaseHtmlElementAttrs {
  class?: string;

  id?: string;

  children?: XmlChildren;
}

export interface HtmlIntrinsicElements {
  div: BaseHtmlElementAttrs & {};

  nav: BaseHtmlElementAttrs & {};
  ul: BaseHtmlElementAttrs & {};
  ol: BaseHtmlElementAttrs & {};
  li: BaseHtmlElementAttrs & {};

  h1: BaseHtmlElementAttrs & {};
  h2: BaseHtmlElementAttrs & {};
  h3: BaseHtmlElementAttrs & {};
  h4: BaseHtmlElementAttrs & {};
  h5: BaseHtmlElementAttrs & {};
  h6: BaseHtmlElementAttrs & {};

  p: BaseHtmlElementAttrs & {};
  pre: BaseHtmlElementAttrs & {};

  span: BaseHtmlElementAttrs & {};
  code: BaseHtmlElementAttrs & {};
  a: BaseHtmlElementAttrs & { href: string };
}
