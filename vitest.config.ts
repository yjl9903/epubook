import { defineConfig } from 'vitest/config';

import { Epubook } from './packages/xml/src/vite';

export default defineConfig({
  plugins: [Epubook()],
  test: {
    projects: ['packages/*']
  }
});
