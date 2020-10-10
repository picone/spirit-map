module.exports = {
  runtimeCompiler: true,
  productionSourceMap: false,
  outputDir: 'dist/web',

  css: {
    extract: false,
    sourceMap: true,
    loaderOptions: {
      less: {
        modifyVars: {
          'primary-color': '#c62f2f',
          'link-color': '#c62f2f',
          'border-radius-base': '4px'
        },
        javascriptEnabled: true
      }
    },
    requireModuleExtension: true
  }
}