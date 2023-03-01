# @epubook/core

The fundamental module of [epubook](https://github.com/yjl9903/epubook) for generating EPUB books.

> 👷‍♂️ Still work in progress.

## Installation

```bash
npm i @epubook/core
```

## Usage

```ts
import { Epub } from '@epubook/core'

const book = new Epub({
  title: 'Test Book',
  date: new Date('2023-02-01T11:00:00.000Z'),
  lastModified: new Date('2023-02-26T11:00:00.000Z'),
  creator: 'XLor',
  description: 'for test usage',
  source: 'imagine'
})

// ...

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

You can see [@epubook/theme-default](https://github.com/yjl9903/epubook/tree/main/packages/theme-default) for more details.

## License

MIT License © 2023 [XLor](https://github.com/yjl9903)
