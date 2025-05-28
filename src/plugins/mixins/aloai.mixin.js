import _ from 'lodash'
import * as AloAi from '../../constants/aloai'

export default _.merge({
  methods: {
    isAloaiEnabled (company) {
      return company.aloai_text_agents_enabled || company.aloai_voice_inbound_agents_enabled || company.aloai_voice_outbound_agents_enabled
    },
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
    getAgentTypeLabel (type) {
      switch (type) {
        case AloAi.TYPE_TEXT:
          return 'Text'
        case AloAi.TYPE_VOICE:
          return 'Voice'
        default:
          return 'Unknown'
      }
    }
  }
})
