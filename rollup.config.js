import buble from 'rollup-plugin-buble'

const pkg = require('./package.json')

export default {
  entry: 'src/index.js',
  plugins: [buble()],
  sourceMap: true,
  targets: [
    {
      dest: pkg['main'],
      format: 'umd',
      moduleName: 'ReduxWebsocketMiddleware',
      exports: 'named'
    },
    {
      dest: pkg['jsnext:main'],
      format: 'es'
    }
  ]
}
