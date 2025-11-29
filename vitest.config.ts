import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    {
      name: 'epubook:jsx',
      config() {
        return {
          alias: {
            '@epubook/xml/jsx-runtime': path.join(
              import.meta.dirname,
              './packages/xml/src/jsx-runtime.ts'
            ),
            '@epubook/xml/jsx-dev-runtime': path.join(
              import.meta.dirname,
              './packages/xml/src/jsx-runtime.ts'
            )
          },
          esbuild: {
            // jsxImportSource: '@epubook/xml/jsx-runtime'
          }
        };
      }
    }
  ],
  test: {
    projects: ['packages/*']
  }
});
