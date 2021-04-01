import randomColor from 'randomcolor'

export default {
  methods: {
    avatarStyle (name) {
      if (!name) {
        return
      }

      let bg = this.intToRGB(this.hashCode(name))
      return {
        backgroundColor: bg,
        color: this.overlayColor(bg)
      }
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

    intToRGB (i) {
      let c = (i & 0x00FFFFFF)
        .toString(16)
        .toUpperCase()

      return '#' + '00000'.substring(0, 6 - c.length) + c
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
    }
  }
}
