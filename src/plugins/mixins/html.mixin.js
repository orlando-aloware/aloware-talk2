export default {
  methods: {
    sanitizeText (string) {
      if (string) {
        let entityMap = {
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
    }
  }
}
