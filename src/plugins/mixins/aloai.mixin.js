import _ from 'lodash'
import * as AloAi from '../../constants/aloai'

export default _.merge({
  methods: {
    formatDirection (direction) {
      switch (direction) {
        case AloAi.DIRECTION_INBOUND:
          return 'Inbound'
        case AloAi.DIRECTION_OUTBOUND:
          return 'Outbound'
        default:
          return 'Unknown'
      }
    },
    directionColor (direction) {
      return (
        {
          [AloAi.DIRECTION_INBOUND]: 'blue-6',
          [AloAi.DIRECTION_OUTBOUND]: 'green-6'
        }[direction] || 'black'
      )
    },
    getEnrollmentTypeLabel (type) {
      switch (type) {
        case AloAi.ENROLLMENT_TYPE_TEXT:
          return 'SMS'
        case AloAi.ENROLLMENT_TYPE_VOICE:
          return 'Call'
        default:
          return 'Unknown'
      }
    },
    getEnrollmentTypeColor (type) {
      return 'black'
    }
  }
})
