# epubook

[![CI](https://github.com/yjl9903/epubook/actions/workflows/ci.yml/badge.svg)](https://github.com/yjl9903/epubook/actions/workflows/ci.yml)

A Node [EPUB 3](https://www.w3.org/publishing/epub32/) generation library which supports from **low-level API** to **high-level ebook abstraction** with **customizable themes**.

> 👷‍♂️ Still work in progress.

+ Just use [epubook](https://github.com/yjl9903/epubook/tree/main/packages/epubook) in your project to generate epub easily
+ [@epubook/core](https://github.com/yjl9903/epubook/tree/main/packages/core) provides low-level EPUB generation API
+ [@epubook/theme-default](https://github.com/yjl9903/epubook/tree/main/packages/theme-default) is the default theme used in [epubook](https://github.com/yjl9903/epubook/tree/main/packages/epubook)
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

await ebook.cover('./assets/cover.jpg')

await ebook.writeFile('./output.epub')
```

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
