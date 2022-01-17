# html-webpack-inject-code-plugin

## Webpack config

```js
const HtmlWebpackInjectCodePlugin = require('html-webpack-inject-code-plugin').default;

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      // some config
    }),
    new HtmlWebpackInjectCodePlugin({
      headHtmlTagObjectList: [
        {
          tagName: "script",
          innerHTML: `
            window.onresize = function() {
              console.log('test')
            }
          `
        }
      ],
      excludeFileCallback: (fileName) => fileName === 'test.html'
    })
  ]
};
```
## LICENSE

MIT
