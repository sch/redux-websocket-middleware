import buble from 'rollup-plugin-buble'

const settings = require('./package.json')

export default {
  entry: 'src/index.js',
  plugins: [buble()],
  targets: [
    {
      dest: settings['main'],
      format: 'umd',
      moduleName: 'ReduxWebsocketMiddleware',
      exports: 'named',
      sourceMap: true
    },
    {
      dest: settings['jsnext:main'],
      format: 'es',
      sourceMap: true
    }
  ]
}
