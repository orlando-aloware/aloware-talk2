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
    }
  }
}
