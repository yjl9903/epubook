import { defineBuildConfig } from 'unbuild';

import { UnbuildPreset } from '@epubook/xml/unbuild';

export default defineBuildConfig({
  entries: ['src/index'],
  declaration: true,
  clean: true,
  externals: ['unbuild', 'rollup'],
  rollup: {
    emitCJS: true
  },
  preset: UnbuildPreset({ inject: false })
});
