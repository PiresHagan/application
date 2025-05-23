// webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
const webpack = require('webpack')
const dotenv = require('dotenv');

module.exports = (env, options) => {

  const { MODE } = env;

  if (MODE == "development") {
    require('dotenv').config({ path: './.env.dev' })
  } else if (MODE == "production") {
    require('dotenv').config({ path: './.env.prod' })
  }

  return {
    mode: MODE,
    target: 'web',

    entry: {
      main: '/src/index.jsx',
    },

    devServer: {
      hot: true,
      historyApiFallback: true,
      port: process.env.REACT_APP_PORT,
      static: {
        directory: path.join(__dirname, 'dist'),
      },
      client: {
        overlay: true,
      },
    },

    output: {
      filename: 'js/main.[contenthash].js',
      chunkFilename: 'js/main.[id].[contenthash].js',
      publicPath: '/',
    },

    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          loader: "babel-loader",
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.pcss$/,
          use: [
            { loader: 'style-loader' },
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                modules: {
                  localIdentName: '[name]__[local]_[hash:8]',
                },
              },
            },
            { loader: 'postcss-loader' },
          ],
        },
      ],
    },

    resolve: {
      extensions: ['.jsx', '.js'],
    },

    plugins: [
      new CopyPlugin({
        patterns: [
          {
            context: 'src/static',
            from: '**/*',
            globOptions: {
              ignore: ['**/index.html'],
            },
          },
        ],
      }),
      new HtmlWebpackPlugin({
        inject: true,
        template: path.resolve(__dirname, 'src/static/index.html'),
      }),
      new webpack.DefinePlugin({
        BACKEND_URL: JSON.stringify(process.env.REACT_APP_BACKEND_URL),
        BACKEND_PORT: JSON.stringify(process.env.REACT_APP_BACKEND_PORT),
        BACKEND_CONTEXT_PATH: JSON.stringify(process.env.REACT_APP_BACKEND_CONTEXT_PATH)
      }),
    ],
  }
}