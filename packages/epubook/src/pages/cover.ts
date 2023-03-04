import { Image, XHTML } from '@epubook/core';

export class Cover extends XHTML {
  private _image!: Image;

  public static from(image: Image, xhtml: XHTML) {
    const cover = new Cover(xhtml.filename(), xhtml.meta(), xhtml.content());
    cover._image = image;
    return cover;
  }

  public image() {
    return this._image;
  }
}
