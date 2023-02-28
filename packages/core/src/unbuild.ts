import type { Plugin } from 'rollup';
import type { RollupBuildOptions } from 'unbuild';

export const EsbuildOptions: Partial<RollupBuildOptions['esbuild']> = {
  jsxFactory: 'h',
  jsxFragment: 'fragment',
  loaders: {
    '.js': 'js',
    '.ts': 'ts',
    '.jsx': 'jsx',
    '.tsx': 'tsx'
  }
};

export function Rollup(): Plugin {
  return {
    name: 'epubook:inject-tsx',
    transform(code, id) {
      if (id.endsWith('.tsx')) {
        return `import { h, fragment } from '@epubook/core';\n` + code;
      }
    }
  };
}
