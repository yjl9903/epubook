import { Theme, XHTMLBuilder } from '@epubook/core';

export async function loadTheme(pkg: string): Promise<Theme<{}>> {
  return {
    name: 'theme-default',
    images: [],
    styles: [],
    pages: {
      cover(file, { image }) {
        return new XHTMLBuilder(file)
          .title('cover')
          .body({ tag: 'img', attrs: { src: image.relative(file) } });
      }
    }
  };
}
