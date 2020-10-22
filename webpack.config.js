const { resolve } = require('path')

module.exports = {
  entry: './src/index.js',
  output: {
    path: resolve(__dirname, 'umd/'),
    filename: 'archon.js',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    library: 'Archon'
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  }
}
