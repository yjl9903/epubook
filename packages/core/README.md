# @epubook/core

[![version](https://img.shields.io/npm/v/@epubook/core?color=rgb%2850%2C203%2C86%29&label=@epubook/core)](https://www.npmjs.com/package/@epubook/core) [![CI](https://github.com/yjl9903/epubook/actions/workflows/ci.yml/badge.svg)](https://github.com/yjl9903/epubook/actions/workflows/ci.yml)

The fundamental module of [epubook](https://github.com/yjl9903/epubook). It provides low-level API for generating EPUB books.

## Installation

```bash
npm i @epubook/core
```

## Usage

```ts
import { Epub, HTML } from '@epubook/core'

const book = new Epub({
  title: 'Test Book',
  date: new Date('2023-02-01T11:00:00.000Z'),
  lastModified: new Date('2023-02-26T11:00:00.000Z'),
  creator: 'XLor',
  description: 'for test usage',
  source: 'imagine'
})

const page = new HTML('start.xhtml', '...')

book.item(page).spine(page).toc([{ title: 'Start', page }])

await book.writeFile('./test.epub')
```

### JSX

You can use jsx to create XHTML node.

```tsx
// Your theme code ...

import { XHTMLBuilder } from '@epubook/core'

const builder = new XHTMLBuilder()

builder
  .body(<h1>Title</h1>)
  .body(<p>This is a paragraph</p>)
  .build()
```

Currently, it supports use [unbuild](https://github.com/unjs/unbuild) to transform JSX / TSX and bundle your library.

```ts
// build.config.ts

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
```

You can see [@epubook/theme](https://github.com/yjl9903/epubook/tree/main/packages/theme) for more details.

## License

MIT License © 2023 [XLor](https://github.com/yjl9903)
