import { Theme, XHTMLBuilder } from '@epubook/core';

export * from './chapter';

export async function DefaultTheme(): Promise<Theme<{}>> {
  return {
    name: '@epubook/theme-default',
    styles: [],
    images: [],
    pages: {
      cover(file, { image, title = '封面' }) {
        return new XHTMLBuilder(file)
          .title(title)
          .body({ tag: 'img', attrs: { src: image.relative(file) } });
      }
    }
  };
}
