import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: ['src/index'],
  declaration: true,
  clean: true,
  externals: ['unbuild', 'rollup'],
  rollup: {
    emitCJS: true
  }
});
