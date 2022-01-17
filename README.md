# html-webpack-code-inject-plugin

## Webpack config

```js
const HtmlWebpackCodeInjectPlugin = require('html-webpack-code-inject-plugin').default;

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      // some config
    }),
    new HtmlWebpackCodeInjectPlugin({
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
