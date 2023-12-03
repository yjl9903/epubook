import type { Plugin } from 'vite';

export function Epubook(): Plugin {
  return {
    name: 'epubook:jsx',
    config() {
      return {
        esbuild: {
          jsxFactory: '__epubook_xml.h',
          jsxFragment: '__epubook_xml.Fragment',
          jsxInject: `import * as __epubook_xml from '@epubook/xml'`
        }
      };
    }
  };
}
