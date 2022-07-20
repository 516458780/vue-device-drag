const { defineConfig } = require('@vue/cli-service')
// const path = require('path')

module.exports = {
  ...defineConfig({
    transpileDependencies: true
  }),
  // configureWebpack: {
  //   entry: {
  //     index: './src/assets/device-drag.js'
  //   },
  //   output: {
  //     filename: '[name].js',
  //     path: path.resolve(__dirname, './dist'),
  //     library: {
  //       type: 'commonjs-static'
  //     },
  //     clean: true
  //   }
  // },
  // chainWebpack: config => {
  //   config.merge({
  //     entry: {
  //       index: './src/assets/device-drag.js'
  //     },
  //     output: {
  //       filename: '[name].js',
  //       path: path.resolve(__dirname, './dist'),
  //       library: {
  //         type: 'commonjs-static'
  //       },
  //       clean: true
  //     }
  //   })
  // }
}
