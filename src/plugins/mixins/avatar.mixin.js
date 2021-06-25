import randomColor from 'randomcolor'
import * as CommunicationDirection from '../../constants/communication-direction'

export default {
  data () {
    return {
      blueDispositionStatus: null,
      greenDispositionStatuses: []
    }
  },

  created () {
    let dispositionMatchStatusIds = []
    let appointmentSetStatus = null

    for (let dispositionStatus of this.dispositionStatuses) {
      // check for blue disposition status
      if (dispositionStatus.name === 'Appointment-Set') {
        appointmentSetStatus = dispositionStatus
      }

      // check for green disposition status
      if (dispositionStatus.name === 'Appointment-Showed' || dispositionStatus.name.toLowerCase().startsWith('sold')) {
        dispositionMatchStatusIds.push(dispositionStatus.id)
      }
    }

    this.blueDispositionStatus = appointmentSetStatus
    this.greenDispositionStatuses = dispositionMatchStatusIds
  },
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
