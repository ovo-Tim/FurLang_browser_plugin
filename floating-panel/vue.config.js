const { defineConfig } = require('@vue/cli-service')
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
module.exports = defineConfig({
  transpileDependencies: true,
  outputDir: '../entrypoints/panel_dist',
  publicPath: './',
  configureWebpack: {
    plugins: [
      new HtmlWebpackInlineSourcePlugin()
    ]
  }
})
