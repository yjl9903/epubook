declare global {
  namespace JSX {
    interface IntrinsicElements extends EpubIntrinsicElements {}
  }
}

export interface EpubIntrinsicElements {
  li: {};
  ol: {};
  span: {};
  a: { href: string };
}
