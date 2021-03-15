const path = require('path')

module.exports = ({ config }) => {
  config.module.rules.push({
    test: /\.(scss|sass)$/,
    use: ['style-loader', 'css-loader', 'sass-loader'],
    include: path.resolve(__dirname, '../')
  })
  config.module.rules.push({
    test: /\.stories\.jsx?$/,
    loaders: [require.resolve('@storybook/source-loader')],
    enforce: 'pre'
  })

  config.resolve.modules = [
    path.resolve(__dirname, "..", "src"),
    "node_modules",
  ]

  config.resolve.alias = {
    ...config.resolve.alias,
    'components': path.resolve(__dirname, '../src/components'),
    'assets': path.resolve(__dirname, '../src/assets'),
    'constants': path.resolve(__dirname, '../src/constants'),
    'css': path.resolve(__dirname, '../src/css'),
    'pages': path.resolve(__dirname, '../src/pages'),
    'layouts': path.resolve(__dirname, '../src/layouts'),
    'store': path.resolve(__dirname, '../src/store')
  }

  return config
}
