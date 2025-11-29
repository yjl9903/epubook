import type { ItemRef } from './manifest';
import type { Rendition } from './rendition';

export class Spine {
  private _itemrefs: ItemRef[] = [];

  public constructor(public readonly rendition: Rendition) {}

  public get itemrefs() {
    return this._itemrefs;
  }

  public set() {
    // TODO
    return this;
  }

  public push() {
    // TODO
    return this;
  }

  public clear() {
    // TODO
    return this;
  }
}
