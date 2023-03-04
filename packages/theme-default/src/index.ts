import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Theme, XHTMLBuilder } from '@epubook/core';

import { Chapter } from './chapter';
import { DefaultThemePageTemplate } from './types';

export * from './types';
export * from './chapter';

const styles = ['./styles/main.css'];

export async function DefaultTheme(): Promise<Theme<DefaultThemePageTemplate>> {
  return {
    name: '@epubook/theme-default',
    styles: await Promise.all(styles.map((d) => loadStyle(d))),
    images: [],
    pages: {
      cover(file, { image, title = '封面' }) {
        return new XHTMLBuilder(file)
          .title(title)
          .body({ tag: 'img', attrs: { src: image.relative(file) } });
      },
      nav(file, { nav, option }) {
        if (!option.title) {
          option.title = '目录';
        }
        return new XHTMLBuilder(file).title('目录');
      },
      chapter: Chapter
    }
  };
}

async function loadStyle(dir: string) {
  // NOTE: checker built file path
  const d = path.join(fileURLToPath(import.meta.url), '../../', dir);
  return fs.promises.readFile(d, 'utf-8');
}
