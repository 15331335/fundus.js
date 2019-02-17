const path = require('path');

module.exports = {
  entry: './src/index.js',
  mode: 'development',
  devServer: {
    contentBase: './dist',
    clientLogLevel: 'none'
  },
  output: {
    filename: 'fundus.js',
    path: path.resolve(__dirname, 'dist')
  }
};