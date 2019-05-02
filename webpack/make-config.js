var path = require('path');
var webpack = require('webpack');
var MiniCssExtractPlugin = require('mini-css-extract-plugin');
var OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
var CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

module.exports = function(options) {
  var isDevelopment = options.isDevelopment;

  // babel-preset-react-app require set NODE_ENV
  process.env.NODE_ENV = isDevelopment ? 'development' : 'production';

  var plugins = [
    new CaseSensitivePathsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        __DEV__: isDevelopment,
        NODE_ENV: JSON.stringify(isDevelopment ? 'development' : 'production'),
        IS_BROWSER: true,
        // https://github.com/bunkat/later/issues/155
        LATER_COV: false
      }
    }),
    new MiniCssExtractPlugin({
      filename: '[name].min.css',
      disable: isDevelopment
    })
  ];

  if (!isDevelopment) {
    plugins.push(
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      new OptimizeCssAssetsPlugin()
    );
  }

  var entry = {};
  if (isDevelopment) {
    entry = {
      bundle: ['./src/styles/kbc.less', options.entry],
      parts: ['./src/styles/kbc.less', './src/scripts/parts']
    };
  } else {
    entry = {
      bundle: ['./src/scripts/app'],
      parts: ['./src/scripts/parts']
    };
  }

  return {
    mode: isDevelopment ? 'development' : 'production',
    devtool: isDevelopment ? 'eval' : 'source-map',
    entry: entry,
    output: Object.assign(
      {
        path: path.resolve(
          __dirname,
          isDevelopment ? '../dist' : '../dist/' + process.env.KBC_REVISION
        ),
        filename: isDevelopment ? '[name].js' : '[name].min.js',
        publicPath: isDevelopment ? '/scripts/' : '',
        libraryExport: 'default',
        library: 'kbcApp'
      },
      isDevelopment ? { globalObject: 'this' } : {}
    ),
    plugins: plugins,
    resolve: {
      extensions: ['*', '.js', '.jsx']
    },
    devServer: {
      host: '0.0.0.0',
      port: 3000,
      inline: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*'
      }
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          enforce: 'pre',
          loader: 'eslint-loader',
          options: {
            failOnError: true,
            configFile: path.resolve(__dirname, '../.eslintrc')
          }
        },
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          include: path.resolve(__dirname, '../src/scripts'),
          use: [isDevelopment ? 'react-hot-loader' : false, 'babel-loader'].filter(Boolean)
        },
        {
          test: /\.less$/,
          use: [
            isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
            'less-loader'
          ]
        },
        {
          test: /.(png|woff|woff2|eot|ttf|svg|jpg|mp3)/,
          loader: 'file-loader'
        }
      ]
    }
  };
};
