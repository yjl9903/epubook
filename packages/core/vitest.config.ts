import { defineConfig } from 'vitest/config';

import { Epubook } from '@epubook/xml/vite';

export default defineConfig({
  plugins: [Epubook()]
});
