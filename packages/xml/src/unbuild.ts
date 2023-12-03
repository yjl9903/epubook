import type { Plugin } from 'rollup';
import type { BuildConfig } from 'unbuild';

export const UnbuildPreset: (options?: { inject?: boolean }) => BuildConfig = ({
  inject = true
} = {}) => ({
  rollup: {
    esbuild: {
      jsxFactory: inject ? '__epubook_xml.h' : 'h',
      jsxFragment: inject ? '__epubook_xml.Fragment' : 'Fragment',
    }
  },
  hooks: {
    'rollup:options'(_options, config) {
      const plugins = config.plugins;
      if (inject && Array.isArray(plugins)) {
        plugins.push(Rollup() as any);
      }
    }
  }
});

export function Rollup(): Plugin {
  return {
    name: 'epubook:inject-tsx',
    transform(code, id) {
      if (id.endsWith('.tsx')) {
        return `import * as __epubook_xml from '@epubook/xml';\n` + code;
      }
    }
  };
}
