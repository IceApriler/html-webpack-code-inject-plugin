const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlWebpackCodeInjectPlugin = require('../../dist/index').default

module.exports = {
  entry: {
    app: './main.js',
  },
  output: {
    path: path.join(__dirname, '..', 'dist'),
    filename: 'js/[name].[hash:7].js',
    publicPath: '/',
  },
  plugins: [
    new CleanWebpackPlugin(['dist'], {
      root: path.resolve(__dirname, '..'),
    }),
    new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, '..', `dist/index.html`),
      template: 'index.html',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
      },
    }),
    new HtmlWebpackCodeInjectPlugin({
      headHtmlTagObjectList: [
        {
          tagName: 'script',
          innerHTML: `
                if (window.location.hash.indexOf("html_no_cache") === -1) {
                  console.log("?html_no_cache=" + Date.now());
                  window.location.hash=window.location.hash + "?html_no_cache=" + Date.now();
                  window.location.reload(true);
                };
              `,
        },
        {
          tagName: "meta",
          attributes: {
            name: 'buildTime',
            content: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).replace(/\//g, '-'),
          },
        },
      ],
      bodyHtmlTagObjectList: [
        {
          tagName: 'div',
          innerHTML: `<h1>bodyHtmlTagObjectList</h1>`,
        },
      ],
      headCallback: (html) => {
        console.log('---------1')
        console.log(html)
        // return html.replace(/<head>/i, '<head><link rel="stylesheet" href="./css/style-test.css">')
      },
      bodyCallback: (html) => {
        console.log('---------2')
        console.log(html)
        // return html.replace(/<body>/i, '<body><div id="app-test"></div>')
      },
      // excludeFileCallback: (filename) => {
      //   return filename.indexOf('index.html') > -1
      // },
    }),
  ],
}
