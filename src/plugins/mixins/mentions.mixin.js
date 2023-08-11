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

        value.parentNode.replaceChild(document.createTextNode('<user:' + id + '>'), value)
      })
      return doc.body.innerText
    }
  }
}
