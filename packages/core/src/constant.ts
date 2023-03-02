import * as path from 'node:path';

export const MIMETYPE = 'application/epub+zip';

export const ImageGif = 'image/gif';
export const ImageJpeg = 'image/jpeg';
export const ImagePng = 'image/png';
export const ImageSvg = 'image/svg+xml';
export const ImageWebp = 'image/webp';

export type ImageMediaType =
  | typeof ImageGif
  | typeof ImageJpeg
  | typeof ImagePng
  | typeof ImageSvg
  | typeof ImageWebp;

export type ImageExtension = 'gif' | 'jpg' | 'jpeg' | 'png' | 'svg' | 'webp';

export const TextCSS = 'text/css';

export const XHTML = 'application/xhtml+xml';

export type MediaType = ImageMediaType | typeof TextCSS | typeof XHTML;

export function getImageMediaType(file: string): ImageMediaType | undefined {
  const ext = path.extname(file);
  switch (ext) {
    case '.gif':
      return ImageGif;
    case '.jpg':
    case '.jpeg':
      return ImageJpeg;
    case '.png':
      return ImagePng;
    case '.svg':
      return ImageSvg;
    case '.webp':
      return ImageWebp;
    default:
      return undefined;
  }
}
