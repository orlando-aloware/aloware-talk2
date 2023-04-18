const SentryWebpackPlugin = require('@sentry/webpack-plugin')

module.exports = {
  devtool: 'source-map', // Source map generation must be turned on
  plugins: [
    new SentryWebpackPlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: process.env.SENTRY_ORGANIZATION,
      project: process.env.SENTRY_PROJECT,
      include: '../dist'
      // release: process.env.SENTRY_RELEASE
    })
  ]
}
