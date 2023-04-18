const SentryWebpackPlugin = require('@sentry/webpack-plugin')
console.log(process.env.SENTRY_AUTH_TOKEN, process.env.SENTRY_ORGANIZATION, process.env.SENTRY_PROJECT)
module.exports = {
  devtool: 'source-map', // Source map generation must be turned on
  plugins: [
    new SentryWebpackPlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: process.env.SENTRY_ORGANIZATION,
      project: process.env.SENTRY_PROJECT,
      include: ['./dist', './src-electron', './src'],
      sourceMapStyle: 'hidden-source-map'
      // release: process.env.SENTRY_RELEASE
    })
  ]
}
