const path = require('path')

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'archon.bundle.js',
    library: 'Archon',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
       test: /\.js$/, //Regular expression
       exclude: /(node_modules|bower_components)/,//excluded node_modules
       use: {
       loader: "babel-loader",
       options: {
         presets: ["@babel/preset-env"]  //Preset used for env setup
        }
       }
      }
    ]
  },
  resolve: {
    fallback: {
      "stream": require.resolve("stream-browserify"),
      "crypto": require.resolve("crypto-browserify"),
      "os": require.resolve("os-browserify/browser"),
      "https": require.resolve("https-browserify"),
      "http": require.resolve("stream-http"),
      "util": require.resolve("util"),
      "assert": require.resolve("assert"),
      "url": require.resolve("url/")
    }
  }
}
