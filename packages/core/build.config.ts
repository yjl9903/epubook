import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: ['src/index'],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
    esbuild: {
      jsxFactory: 'h',
      jsxFragment: 'fragment',
      loaders: {
        '.ts': 'ts',
        '.tsx': 'tsx'
      }
    }
  }
});
