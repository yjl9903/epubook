import type { MediaType } from '../constant';

import type { Resource } from './resource';
import type { Rendition } from './rendition';

export class Manifest {
  private _resources: Resource[] = [];

  public constructor(public readonly rendition: Rendition) {}

  public get resources(): Resource[] {
    return this._resources;
  }

  public add(...resources: Resource[]) {
    this._resources.push(...resources);
    return this;
  }

  public [Symbol.iterator]() {
    return this._resources[Symbol.iterator]();
  }

  public map(fn: (resource: Resource, index: number, manifest: Manifest) => boolean) {
    return this._resources.filter((v, i) => fn(v, i, this));
  }

  public filter(predicate: (resource: Resource, index: number, manifest: Manifest) => boolean) {
    return new Manifest(this.rendition).add(
      ...this._resources.filter((v, i) => predicate(v, i, this))
    );
  }
}

export class Item {
  private _href: string;

  private _id: string;

  private optional: {
    fallback?: string;
    mediaOverlay?: string;
    mediaType?: MediaType;
    properties?: string;
  } = {};

  public constructor(href: string, id: string, info?: typeof this.optional) {
    this._href = href;
    this._id = id;
    info && this.update(info);
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
    return new ItemRef(this._id);
  }
}

export class ItemRef {
  private _idref: string;

  private optional: {
    id?: string;

    linear?: string;

    properties?: string;
  } = {};

  public constructor(idref: string) {
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
