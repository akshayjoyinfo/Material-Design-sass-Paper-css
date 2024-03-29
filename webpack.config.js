const path = require("path");
const autoprefixer = require("autoprefixer");
var HtmlWebpackPlugin = require('html-webpack-plugin');


function tryResolve_(url, sourceFilename) {
  // Put require.resolve in a try/catch to avoid node-sass failing with cryptic libsass errors
  // when the importer throws
  try {
    return require.resolve(url, { paths: [path.dirname(sourceFilename)] });
  } catch (e) {
    return "";
  }
}

function tryResolveScss(url, sourceFilename) {
  // Support omission of .scss and leading _
  const normalizedUrl = url.endsWith(".scss") ? url : `${url}.scss`;
  return (
    tryResolve_(normalizedUrl, sourceFilename) ||
    tryResolve_(
      path.join(
        path.dirname(normalizedUrl),
        `_${path.basename(normalizedUrl)}`
      ),
      sourceFilename
    )
  );
}

function materialImporter(url, prev) {
  if (url.startsWith("@material")) {
    const resolved = tryResolveScss(url, prev);
    return { file: resolved || url };
  }
  return { file: url };
}

module.exports = {
  entry: ['./app.scss', './app.js', './index.html'],
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'bundle.css',
              path: path.resolve(__dirname, './dist'),
            },
          },
          {loader: 'extract-loader'},
          {loader: 'css-loader'},
          {loader: 'postcss-loader',
            options: {
              plugins: () => [autoprefixer()],
            },
          },
          {
            loader: 'sass-loader',
            options: {
              importer: materialImporter
            },
          }
        ],
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015'],
        },
      },
      {
        test: /\.html/, 
        loader: 'file-loader?name=[name].[ext]', 
      },
    ],
  },
};