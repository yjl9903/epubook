import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: ['src/index', 'src/cli.ts'],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true
  }
});
