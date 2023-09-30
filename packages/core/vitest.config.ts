import { defineConfig } from 'vitest/config';

import { transform } from 'esbuild';

export default defineConfig({
  plugins: [
    {
      name: 'epubook:transform-jsx',
      enforce: 'pre',
      async transform(code, id) {
        if (id.endsWith('.tsx')) {
          return await transform(code, {
            loader: 'tsx',
            sourcefile: id,
            jsxFactory: 'h',
            jsxFragment: 'Fragment'
          });
        }
      }
    }
  ]
});
