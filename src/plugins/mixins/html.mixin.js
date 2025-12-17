export default {
  methods: {
    sanitizeText (string) {
      if (string) {
        const entityMap = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          '\'': '&#39;',
          '/': '&#x2F;',
          '`': '&#x60;',
          '=': '&#x3D;'
        }
        return String(string).replace(/[&<>"'`=/]/g, function (s) {
          return entityMap[s]
        })
      }
      return ''
    },

    setPageTitle (title) {
      document.title = title
    },

    setPageTitleInfoText (infoText) {
      this.setPageTitle(`${document.title} ${infoText}`)
    },

    setDocumentFavicon (faviconBasePath) {
      const sizes = ['96x96', '32x32', '16x16', '128x128']
      sizes.forEach(size => {
        let link = document.querySelector(`link[rel="icon"][sizes="${size}"]`)
        if (!link) {
          link = document.createElement('link')
          link.rel = 'icon'
          link.sizes = size
          link.type = 'image/png'
          document.getElementsByTagName('head')[0].appendChild(link)
        }
        link.href = `${faviconBasePath}`
      })

      let linkIco = document.querySelector('link[rel="icon"][type="image/ico"]')
      if (!linkIco) {
        linkIco = document.createElement('link')
        linkIco.rel = 'icon'
        linkIco.type = 'image/ico'
        document.getElementsByTagName('head')[0].appendChild(linkIco)
      }
      linkIco.href = `${faviconBasePath}`
    }
  }
}
