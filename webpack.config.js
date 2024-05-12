const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: "development",
  context: path.join(__dirname, "src"),
  entry: ["./main.ts"],
  output: {
    path: path.join(__dirname, "public"),
    filename: "[hash].js",
  },
  plugins: [
    new HtmlWebpackPlugin({template: 'index.html'}),
  ],

  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
      alias: {
        '@mui/material': '@mui/joy',
      },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ['babel-loader', 'ts-loader'],
        exclude: /node_modules/,
      },
      {
        test: /\.m?js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
              modules: true,
            },
          },
        ],
      },
      {
        test: /(\.wav|\.svg)$/,
        exclude: /node_modules/,
        use: ['file-loader?name=[name].[ext]']
      }
    ]
  }
}
