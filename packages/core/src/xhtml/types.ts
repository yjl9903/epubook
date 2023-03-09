declare global {
  namespace JSX {
    interface IntrinsicElements extends EpubIntrinsicElements {}
  }
}

export interface XHTMLNode {
  tag: string;
  attrs?: Record<string, string>;
  children?: Array<string | XHTMLNode>;
}

interface BaseElementAttrs {
  class?: string;

  id?: string;

  html?: string;
}

export interface EpubIntrinsicElements {
  nav: BaseElementAttrs & {};
  ul: BaseElementAttrs & {};
  ol: BaseElementAttrs & {};
  li: BaseElementAttrs & {};

  h1: BaseElementAttrs & {};
  h2: BaseElementAttrs & {};
  h3: BaseElementAttrs & {};
  h4: BaseElementAttrs & {};
  h5: BaseElementAttrs & {};
  h6: BaseElementAttrs & {};

  p: BaseElementAttrs & {};
  pre: BaseElementAttrs & {};

  span: BaseElementAttrs & {};
  code: BaseElementAttrs & {};
  a: BaseElementAttrs & { href: string };
}
