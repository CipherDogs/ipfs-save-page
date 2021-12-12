# ipfs-save-page

## Mission

Help you fuckgoogle rigth from Firefox!

## Firefox dev

- [Trying_it_out](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension#Trying_it_out)
- [Package your extension](https://extensionworkshop.com/documentation/publish/package-your-extension/)

## Development

```
yarn install
yarn run watch:dev
```

1. Go to about:debugging#addons
2. Click on "Load Temporary Add-on" and point to dist/manifest.json

If developing, after making changes - reload the extension

### Build

```
yarn run build:dev
```

## Production

```
yarn install
yarn run watch
```

### Build

```
yarn run build
```
