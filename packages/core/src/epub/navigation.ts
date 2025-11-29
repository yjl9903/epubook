import type { Rendition } from './rendition';

export class Navigation {
  public constructor(public readonly rendition: Rendition) {}

  // public setToc(nav: NavList, option: Partial<NavOption> = {}) {
  //   const toc = Toc.generate('nav.xhtml', nav, option);
  //   if (!option.builder) {
  //     toc.title(option.title ?? 'na').language(this._metadata.language);
  //   }
  //   const res = toc.build();
  //   this._toc = Toc.from(new XHTML(res.filename, res.meta, res.content));
  //   return this;
  // }
}
