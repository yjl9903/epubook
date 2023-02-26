export const MIMETYPE = 'application/epub+zip';

export const ImageGif = 'image/gif';
export const ImageJpeg = 'image/jpeg';
export const ImagePng = 'image/png';
export const ImageSvg = 'image/svg+xml';
export const ImageWebp = 'image/webp';

export type ImageMediaType = typeof ImageGif | typeof ImageJpeg | typeof ImagePng;

export const TextCSS = 'text/css';

export const XHTML = 'application/xhtml+xml';

export type MediaType = ImageMediaType | typeof TextCSS | typeof XHTML;
