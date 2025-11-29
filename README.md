# epubook

[![version](https://img.shields.io/npm/v/epubook?color=rgb%2850%2C203%2C86%29&label=epubook)](https://www.npmjs.com/package/epubook) [![CI](https://github.com/yjl9903/epubook/actions/workflows/ci.yml/badge.svg)](https://github.com/yjl9903/epubook/actions/workflows/ci.yml)

A Node [EPUB 3](https://www.w3.org/publishing/epub32/) generation library which supports from **low-level API** to **high-level ebook abstraction** with **customizable themes**.

+ Just use [epubook](https://github.com/yjl9903/epubook/tree/main/packages/epubook) in your project to generate epub easily
+ [@epubook/core](https://github.com/yjl9903/epubook/tree/main/packages/core) provides low-level EPUB generation API
+ [@epubook/theme](https://github.com/yjl9903/epubook/tree/main/packages/theme) is the default theme used in [epubook](https://github.com/yjl9903/epubook/tree/main/packages/epubook)
+ [@epubook/cli](https://github.com/yjl9903/epubook/tree/main/packages/cli) generates EPUB from local configuration and markdown content

## Usage

### Library

```bash
npm i epubook
```

```ts
import { Epubook } from 'epubook'

const ebook = await Epubook.create({
  title: 'title',
  description: 'something'
})

const cover = await ebook.cover('./assets/cover.jpg')
const main = ebook.page('chapter', { title: 'Main', content: 'Hello, World!' })

ebook.toc(cover, main)

await ebook.writeFile('./output.epub')
```

You can see full generation demo [here](https://github.com/yjl9903/epubook/blob/main/packages/epubook/test/index.test.ts).

### CLI

```bash
npm i -g @epubook/cli

epubook --version

epubook --help
```

## Resources

+ [EPUB 3.2 specification](https://www.w3.org/publishing/epub32/)
+ [EPUB 3.3 specification](https://www.w3.org/TR/epub-33/)
+ [epubcheck](https://github.com/w3c/epubcheck)
+ [epub-tests](https://w3c.github.io/epub-tests/)
+ [EbookLib](https://github.com/aerkalov/ebooklib)

## License

MIT License © 2023 [XLor](https://github.com/yjl9903)
