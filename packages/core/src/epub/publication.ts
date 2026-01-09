import { Rendition, PackageDocumentMeta } from './rendition.js';

export class EpubPublication {
  /**
   * See: https://www.w3.org/TR/epub-33/#sec-package-doc
   *
   * Now, it only supports single opf (OEBPS/content.opf)
   *
   * @returns list of package documents
   */
  private _rootfiles: Rendition[] = [];

  private constructor() {}

  public static empty() {
    return new EpubPublication();
  }

  public static create(
    fullPath: string = 'OEBPS/content.opf',
    rootMeta: Partial<PackageDocumentMeta> = {}
  ) {
    const container = new EpubPublication();
    const rendition = new Rendition(fullPath);
    rendition.updateMetadata(rootMeta);
    container._rootfiles.push(rendition);
    return container;
  }

  public get rootfile() {
    if (this._rootfiles.length === 0) throw new Error('no rendition is provided');
    return this._rootfiles[0];
  }

  public get rootfiles(): Rendition[] {
    return this._rootfiles;
  }
}
