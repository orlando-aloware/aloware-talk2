export const CID_AND_LINES_DEMO = {
  url: 'https://capture.navattic.com/cmc46lv43000004le846x0og7',
  config: {
    title: 'CID & Lines'
  }
}

const getNavatticEmbed = () => {
  if (window.NavatticEmbed) {
    return window.NavatticEmbed
  }

  throw new Error('NavatticEmbed is not loaded')
}

export const Navattic = {
  install (Vue, options) {
    Vue.prototype.$navattic = {
      initPopup: ({ url, config }) => {
        try {
          const navatticEmbed = getNavatticEmbed()
          navatticEmbed.initPopup(url, config)
        } catch (error) {
          console.error(error)
        }
      },
      openPopup: ({ url }) => {
        try {
          const navatticEmbed = getNavatticEmbed()
          navatticEmbed.openPopup(url)
        } catch (error) {
          console.error(error)
        }
      }
    }
  }
}
