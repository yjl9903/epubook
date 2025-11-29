import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'jsx-runtime': 'src/jsx-runtime.ts',
    'jsx-dev-runtime': 'src/jsx-dev-runtime.ts'
  },
  format: ['esm'],
  dts: true,
  clean: true,
  outDir: 'dist',
  failOnWarn: true
});
