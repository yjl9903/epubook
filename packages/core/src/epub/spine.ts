import type { ItemRef } from './manifest.js';
import type { Rendition } from './rendition.js';

export class Spine {
  private _itemrefs: ItemRef[] = [];

  public constructor(public readonly rendition: Rendition) {}

  public get itemrefs() {
    return this._itemrefs;
  }

  public shift() {
    return this._itemrefs.shift();
  }

  public unshift(ref: ItemRef) {
    this._itemrefs.unshift(ref);
    return this;
  }

  public pop() {
    return this._itemrefs.pop();
  }

  public push(...itemrefs: ItemRef[]) {
    this._itemrefs.push(...itemrefs);
    return this;
  }

  public clear() {
    this._itemrefs.splice(0, this._itemrefs.length);
    return this;
  }

  public [Symbol.iterator]() {
    return this._itemrefs[Symbol.iterator]();
  }
}
