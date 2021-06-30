import randomColor from 'randomcolor'

export default {
  methods: {
    avatarTooltip (contact) {
      return contact.name
    },

    avatarStyle (isSender = false) {
      let style = {
        backgroundColor: '#95989E',
        color: '#fff'
      }

      if (isSender) {
        style = {
          backgroundColor: '#859ED1',
          color: '#fff'
        }
      }

      return style
    },

    gradientGenerator (name) {
      if (!name) {
        return
      }

      let initials = this.getInitials(name)
      let color1 = randomColor({
        seed: initials[0].charCodeAt(0)
      })
      let color2 = randomColor({
        seed: initials[1].charCodeAt(0)
      })
      return {
        backgroundImage: `linear-gradient(to bottom, ${color1}, ${color2})`,
        color: this.overlayColor(color1)
      }
    },

    getInitials (name) {
      let initials = name.match(/\b\w/g) || []
      return ((initials.shift() || '') + (initials.pop() || '')).toUpperCase()
    },

    hashCode (str) {
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
      }
      return hash
    },

    overlayColor (color) {
      // if only first half of color is defined, repeat it
      if (color.length < 5) {
        color += color.slice(1)
      }
      return (color.replace('#', '0x')) > (0xffffff / 2) ? '#333' : '#fff'
    },

    daysPassedSinceCreated (contact) {
      if (!contact.created_at) {
        return 0
      }

      let createdAtDate = this.$moment(contact.created_at)
      let now = this.$moment()

      return now.diff(createdAtDate, 'days')
    }
  }
}
