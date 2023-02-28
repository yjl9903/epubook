import { defineBuildConfig } from 'unbuild';

import { EsbuildOptions, Rollup } from '@epubook/core';

export default defineBuildConfig({
  entries: ['src/index'],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
    esbuild: EsbuildOptions
  },
  hooks: {
    'rollup:options'(_options, config) {
      const plugins = config.plugins;
      if (Array.isArray(plugins)) {
        plugins.push(Rollup());
      }
    }
  }
});
