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

export interface EpubIntrinsicElements {
  nav: {};
  ul: {};
  ol: {};
  li: {};
  p: {};
  pre: {};
  span: {};
  code: {};
  a: { href: string };
}
