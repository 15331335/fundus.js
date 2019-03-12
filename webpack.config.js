const path = require('path');

module.exports = {
  entry: './src/index.js',
  mode: 'development',
  devServer: {
    contentBase: './dist',
    clientLogLevel: 'none',
    before(app) {
      // use proper mime-type for wasm files
      app.get('*.wasm', function(req, res, next) {
        var options = {
          root: path.resolve(__dirname, 'dist'),
          dotfiles: 'deny',
          headers: {
            'Content-Type': 'application/wasm'
          }
        };
        res.sendFile(req.url, options, function (err) {
          if (err) {
            next(err);
          }
        });
      });
    }
  },
  output: {
    filename: 'fundus.js',
    path: path.resolve(__dirname, 'dist')
  }
};