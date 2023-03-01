import { defineBuildConfig } from 'unbuild';

import { UnbuildPreset } from '@epubook/core';

export default defineBuildConfig({
  entries: ['src/index'],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true
  },
  preset: UnbuildPreset()
});
