import randomColor from 'randomcolor'

export default {
  methods: {
    avatarStyle (isSender = false) {
      const style = {
        backgroundColor: '#95989E',
        color: '#fff'
      }

      if (isSender) {
        style.backgroundColor = '#859ED1'
      }

      return style
    },

    gradientGenerator (name) {
      if (!name) {
        return
      }

      const data = {
        initials: this.$options.filters.initials(name),
        color1: null,
        color2: null
      }
      data.color1 = randomColor({
        seed: data.initials[0].charCodeAt(0)
      })
      data.color2 = randomColor({
        seed: data.initials[1].charCodeAt(0)
      })
      return {
        backgroundImage: `linear-gradient(to bottom, ${data.color1}, ${data.color2})`,
        color: this.overlayColor(data.color1)
      }
    },

    getInitials (name) {
      return this.$options.filters.initials(name)
    },

    hashCode (str) {
      const data = { hash: 0, index: null }
      for (data.index = 0; data.index < str.length; data.index++) {
        data.hash = str.charCodeAt(data.index) + ((data.hash << 5) - data.hash)
      }
      return data.hash
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

      return this.$moment().diff(this.$moment(contact.created_at), 'days')
    }
  }
}
