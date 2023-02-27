# @epubook/theme-default

The default theme for [epubook](https://github.com/yjl9903/epubook).

## Conventions

Themes are published to npm registry, and they should follow the conventions below:

+ Package name should start with `epubook-theme-`, for example `epubook-theme-custom` or `@my/epubook-theme-custom`
+ `package.json` should have a field `epubook` to list the manifest of support pages and styles

### package.json

```json5
{
  // ...
  "epubook": {
    "pages": [],
    "styles": []
  }
}
```

## License

MIT License © 2023 [XLor](https://github.com/yjl9903)
