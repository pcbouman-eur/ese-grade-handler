# ESE Grading tool

This is a tool that can help teachers of ESE (and maybe other EUR faculties as well) handling
they grades and results in a more convenient and robust way than tricky, error-prone `VLOOKUP`/`XLOOKUP`/`INDEX/MATCH` voodoo in Excel.

You can use a live version of the tool on [Github Pages](https://pcbouman-eur.github.io/ese-grade-handler/)

## Development

### Project setup

The build tool for this project is the [yarn package manager](https://yarnpkg.com/). The project itselve makes extensive use of [Vue](https://vuejs.org/), [Vuetify](https://vuetifyjs.com/) and  [SheetJS community edition](https://github.com/SheetJS/sheetjs).

To install the necessary dependencies for development, use
```
yarn install
```

During development, you can use 

```
yarn serve
```

To build the final product, use.

```
yarn build
```

Note that for deployment on github pages, `vue.config.js` does define a prefix `/ese-grade-handler/` for the path. If you want to deploy in on a different URL directly under the root of a domain, this must be adjusted.
