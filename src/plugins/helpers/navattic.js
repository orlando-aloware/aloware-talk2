export const CID_AND_LINES_DEMO = {
  url: 'https://capture.navattic.com/cmc46lv43000004le846x0og7',
  config: { title: 'CID & Lines' }
}

// Track initialized popups
const initializedPopups = new Set()

// Helper method to get the NavatticEmbed object
const getNavatticEmbed = () => {
  if (window.NavatticEmbed) {
    return window.NavatticEmbed
  }

  throw new Error('NavatticEmbed is not loaded')
}

// Helper method to check if a popup is initialized
const isPopupInitialized = (url) => {
  return initializedPopups.has(url)
}

// Helper method to mark a popup as initialized
const markPopupAsInitialized = (url) => {
  initializedPopups.add(url)
}

export const Navattic = {
  install (Vue, options) {
    const navattic = {
      // Helper method to initialize a popup
      initPopup: ({ url, config }) => {
        try {
          const navatticEmbed = getNavatticEmbed()
          navatticEmbed.initPopup(url, config)
          markPopupAsInitialized(url)
        } catch (error) {
          console.error('Error initializing Navattic popup:', error)
        }
      },
      // Helper method to open a popup
      openPopup: ({ url, config }) => {
        try {
          const navatticEmbed = getNavatticEmbed()

          // Check if popup is already initialized
          if (!isPopupInitialized(url)) {
            // Initialize the popup first if not already done
            navattic.initPopup({ url, config })
          }

          // Now open the popup
          navatticEmbed.openPopup(url)
        } catch (error) {
          console.error('Error opening Navattic popup:', error)
        }
      },
      // Helper method to check if a popup is initialized
      isPopupInitialized: (url) => {
        return isPopupInitialized(url)
      },
      // Helper method to get all initialized popups
      getInitializedPopups: () => {
        return Array.from(initializedPopups)
      }
    }

    Vue.prototype.$navattic = navattic
  }
}
