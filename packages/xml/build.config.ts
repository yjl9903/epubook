import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: ['src/index', 'src/unbuild', 'src/vite'],
  declaration: true,
  clean: true,
  externals: ['unbuild', 'rollup', 'vite'],
  rollup: {
    emitCJS: true
  }
});
