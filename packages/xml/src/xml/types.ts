declare global {
  namespace JSX {
    interface IntrinsicElements extends HtmlIntrinsicElements {}
  }
}

export interface XMLNode {
  tag: string;
  attrs?: Record<string, string>;
  children?: Array<string | XMLNode>;
}

export interface XHTMLNode extends XMLNode {}

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

export interface BaseHtmlElementAttrs {
  class?: string;

  id?: string;

  html?: string;
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
