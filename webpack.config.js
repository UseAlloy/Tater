const path = require('path');
const webpack = require('webpack');
const BundleTracker = require('webpack-bundle-tracker');
const CleanWebpackPlugin = require('clean-webpack-plugin');


module.exports = {
  context: __dirname,

  entry: {
    tater: './assets/js/tater',
  },

  output: {
    path: path.resolve('./assets/lib/'),
    filename: '[name].js',
  },

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel?presets[]=react,presets[]=es2015',
      }, // to transform JSX into JS
    ],
  },

  plugins: [
    new BundleTracker({ filename: './assets/webpack-dev-stats.json' }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"development"',
      },
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new CleanWebpackPlugin(['assets/lib'], {
      root: __dirname,
      exclude: ['index.html', 'tater.js'],
    }),
  ],

  sassLoader: {
    includePaths: [
      path.resolve(__dirname, 'css'),
    ],
  },

  resolve: {
    modulesDirectories: ['./node_modules'],
    extensions: ['', '.js', '.jsx'],
  },
};
