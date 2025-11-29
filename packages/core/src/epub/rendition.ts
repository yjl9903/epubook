import { defu } from '../utils';

import { Spine } from './spine';
import { Manifest } from './manifest';
import { Navigation } from './navigation';

export interface Author {
  name: string;

  fileAs?: string;

  role?: string;

  uid?: string;
}

export interface PackageDocumentMeta {
  title: string;
  language: string;
  contributor: Author[];
  coverage: string;
  creator: Author;
  date: Date;
  description: string;
  format: string;
  publisher: string;
  relation: string;
  rights: string;
  source: string;
  subject: string;
  type: string;
  lastModified: Date;
}

export class Rendition {
  private readonly _fullPath: string;

  private readonly _specVersion: '3.0' = '3.0';

  private _uniqueIdentifier = 'uuid';

  private _identifier: string = crypto.randomUUID();

  private _metadata: PackageDocumentMeta = {
    title: '',
    language: 'zh-CN',
    contributor: [],
    coverage: '',
    creator: {
      name: 'unknown',
      uid: 'creator'
    },
    date: new Date(),
    description: '',
    format: '',
    publisher: '',
    relation: '',
    rights: '',
    source: '',
    subject: '',
    type: '',
    lastModified: new Date()
  };

  private _manifest: Manifest;

  private _spine: Spine;

  private _navigation: Navigation;

  constructor(fullPath: string) {
    this._fullPath = fullPath;
    this._manifest = new Manifest(this);
    this._spine = new Spine(this);
    this._navigation = new Navigation(this);
  }

  public get path() {
    return this._fullPath;
  }

  public get version() {
    return this._specVersion;
  }

  // --- metadata ---
  public get title() {
    return this._metadata.title;
  }

  public get language() {
    return this._metadata.language;
  }

  public get creator() {
    return this._metadata.creator;
  }

  public get metadata() {
    return this._metadata;
  }

  public updateMetadata(newMetadata: Partial<PackageDocumentMeta>) {
    // TODO: valiate input data
    this._metadata = defu(newMetadata, this._metadata);
    return this;
  }

  // --- identifier ---
  public get uniqueIdentifier() {
    return this._uniqueIdentifier;
  }

  public get identifier() {
    return this._identifier;
  }

  public setIdentifier(identifier: string, uniqueIdentifier: string = 'uuid') {
    this._identifier = identifier;
    this._uniqueIdentifier = uniqueIdentifier;
  }

  // --- manifest ---
  public get manifest() {
    return this._manifest;
  }

  // --- navigation ---
  public get spine() {
    return this._spine;
  }

  public get navigation() {
    return this._navigation;
  }
}
