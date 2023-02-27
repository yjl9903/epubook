# epubook

A Node EPUB generation library.

It will support the generation of the [latest epub standard](https://www.w3.org/TR/epub-33/) (3.3).

> 👷‍♂️ Still work in progress.

## Installation

```bash
npm i epubook
```

## Usage

```ts
import { Epubook } from 'epubook'

await Epubook.create({ title: 'test' })
```

## Resources

+ [EPUB 3.2 specification](https://www.w3.org/publishing/epub32/)
+ [EPUB 3.3 specification](https://www.w3.org/TR/epub-33/)
+ [epubcheck](https://github.com/w3c/epubcheck)
+ [epub-tests](https://w3c.github.io/epub-tests/)
+ [EbookLib](https://github.com/aerkalov/ebooklib)

## License

MIT License © 2023 [XLor](https://github.com/yjl9903)
