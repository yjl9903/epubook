import { XHTMLBuilder } from '@epubook/core';

import type { DefaultThemePageTemplate } from './types';

export const Chapter: DefaultThemePageTemplate['chapter'] = (file, { title, content }) => {
  const lines = content.split(/\r?\n/);
  return new XHTMLBuilder(file).title(title).body(
    <>
      <h2>{title}</h2>
      {lines.map((l) => (
        <p>{l}</p>
      ))}
    </>
  );
};
