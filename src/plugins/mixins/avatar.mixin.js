import randomColor from 'randomcolor'
import * as CommunicationDirection from '../../constants/communication-direction'

export default {
  methods: {
    avatarTooltip (contact, communication = null) {
      const avatarStyle = this.avatarStyle(contact, communication)

      if ((communication !== null && communication.direction === CommunicationDirection.OUTBOUND) || !avatarStyle) {
        return ''
      }

      switch (avatarStyle.backgroundColor) {
        // Red = New unanswered lead
        case '#FF0000':
          return 'New unanswered lead'
        // Orange = Answered lead that came in 7 days or newer
        case '#FFA500':
          return 'Answered lead that came in 7 days or newer'
        // Yellow = Answered lead that came in between 8 to 30 days
        case '#FFFF00':
          return 'Answered lead that came in between 8 to 30 days'
        // Blue = Pending appointment
        case '#0000FF':
          return 'Pending appointment'
        // Green = Sold
        case '#00FF00':
          return 'Sold'
        // Grey = Default Color
        default:
          return ''
      }
    },

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
