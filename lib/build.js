const webpack = require('webpack')

const webpackBuildCallback = (err, stats) => {
  if (err) {
    console.log('webpacl build error', err)
    return
  }

  const info = stats.toJson()

  if (stats.hasErrors()) {
    console.log(info.errors.join('\n'))
  } else if (stats.hasWarnings()) {
    console.log(info.warnings.join('\n'))
  } else {
    console.log('client built successfully')
  }
}

const init = (mode = 'development') => {
  const compiler = webpack({ ...require('../webpack.config'), mode })

  if (mode === 'production') {
    console.log('building client')
    compiler.run(webpackBuildCallback)
  } else {
    console.log('building client and watching for changes')
    compiler.watch({}, webpackBuildCallback)
  }
}

module.exports = {
  init
}
