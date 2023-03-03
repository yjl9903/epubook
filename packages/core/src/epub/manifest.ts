import type { MediaType } from '../constant';

export class ManifestItem {
  private _href: string;

  private _id: string;

  private optional: {
    fallback?: string;
    mediaOverlay?: string;
    mediaType?: MediaType;
    properties?: string;
  } = {};

  constructor(href: string, id: string) {
    this._href = href;
    this._id = id;
  }

  public update(info: typeof this.optional) {
    for (const [key, value] of Object.entries(info)) {
      if (!!value) {
        this.optional[key as keyof typeof this.optional] = value as any;
      }
    }
    return this;
  }

  public href() {
    return this._href;
  }

  public id() {
    return this._id;
  }

  public fallback() {
    return this.optional.fallback;
  }

  public mediaOverlay() {
    return this.optional.mediaOverlay;
  }

  public mediaType() {
    return this.optional.mediaType;
  }

  public properties() {
    return this.optional.properties;
  }

  public ref() {
    return new ManifestItemRef(this._id);
  }
}

export class ManifestItemRef {
  private _idref: string;

  private optional: {
    id?: string;

    linear?: string;

    properties?: string;
  } = {};

  constructor(idref: string) {
    this._idref = idref;
  }

  public update(info: typeof this.optional) {
    for (const [key, value] of Object.entries(info)) {
      if (!!value) {
        this.optional[key as keyof typeof this.optional] = value as any;
      }
    }
    return this;
  }

  public idref() {
    return this._idref;
  }

  public id() {
    return this.optional.id;
  }

  public linear() {
    return this.optional.linear;
  }

  public properties() {
    return this.optional.properties;
  }
}
