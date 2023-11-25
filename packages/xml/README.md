# @epubook/xml

[![version](https://img.shields.io/npm/v/@epubook/xml?color=rgb%2850%2C203%2C86%29&label=@epubook/xml)](https://www.npmjs.com/package/@epubook/xml) [![CI](https://github.com/yjl9903/epubook/actions/workflows/ci.yml/badge.svg)](https://github.com/yjl9903/epubook/actions/workflows/ci.yml)

## Installation

```bash
npm i @epubook/xml
```

## Usage

```ts
import { defineBuildConfig } from 'unbuild';

import { UnbuildPreset } from '@epubook/xml';

export default defineBuildConfig({
  entries: ['src/index'],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true
  },
  preset: UnbuildPreset()
})
```

## License

MIT License © 2023 [XLor](https://github.com/yjl9903)
