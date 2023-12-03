import { defineConfig } from 'vitest/config';

import { Epubook } from './src/vite';

export default defineConfig({
  plugins: [Epubook()]
});
