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

## License

MIT License © 2023 [XLor](https://github.com/yjl9903)
