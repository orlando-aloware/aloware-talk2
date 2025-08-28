import { mapState } from 'vuex'

export default {

  computed: {
    ...mapState(['users'])
  },

  methods: {
    parseMentionToView (content) {
      if (!content) {
        return content
      }

      const markups = content.match(/(<user:([^>]+)>)/gi)
      const parsedBody = { data: content }
      const _this = this

      if (markups) {
        markups.forEach(function (value, i) {
          const userId = value.match(/\d/g).join('')
          const user = _this.users.find(user => user.id.toString() === userId)
          if (user) {
            const idPattern = new RegExp(`<user:${userId}>`, 'gi')
            parsedBody.data = parsedBody.data.replace(idPattern, `<span class="mention-tag">@${user.name}</span>`)
          }
        })
      }

      return parsedBody.data
    },
    parseMentionToMarkup (content) {
      const parser = new DOMParser()
      const doc = parser.parseFromString(content, 'text/html')

      const spanEl = doc.querySelectorAll('span.mention-tag')
      spanEl.forEach(function (value, i) {
        const id = value.getAttribute('data-id')
        const textNode = doc.createTextNode('<user:' + id + '>')
        value.parentNode.replaceChild(textNode, value)
      })

      // Get the HTML after mention replacement
      let result = doc.body.innerHTML

      // Convert <div> tags to <br> tags (contenteditable often uses divs for new lines)
      result = result.replace(/<\/div><div>/gi, '<br>')
      result = result.replace(/<div>/gi, '<br>')
      result = result.replace(/<\/div>/gi, '')

      // Convert paragraph breaks to <br> tags
      result = result.replace(/<\/p><p>/gi, '<br><br>')
      result = result.replace(/<p>/gi, '')
      result = result.replace(/<\/p>/gi, '')

      // Remove any remaining HTML tags except <br>
      result = result.replace(/<(?!br\s*\/?>)[^>]*>/gi, '')

      // Decode HTML entities (except for our mention markup)
      const textarea = document.createElement('textarea')
      textarea.innerHTML = result
      result = textarea.value

      // Remove leading <br> if it exists
      result = result.replace(/^<br\s*\/?>/i, '')

      // Limit consecutive <br> tags to maximum of 2
      result = result.replace(/(<br\s*\/?>){3,}/gi, '<br><br>')

      return result
    }
  }
}
