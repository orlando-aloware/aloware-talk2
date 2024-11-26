import { mapState } from 'vuex'
import { communicationInfoMixin } from 'src/plugins/mixins'
import moment from 'moment-timezone'

export default {
  mixins: [communicationInfoMixin],

  computed: {
    ...mapState('cache', ['currentCompany'])
  },

  methods: {
    // check if the transcription is allowed for the communication
    isTranscriptionAllowed (communication) {
      return communication.is_eligible_for_transcribe &&
             this.showAudio(communication) &&
             !communication.metadata?.transcription_info &&
             this.isOlderThan(communication.created_at, 15) // check if the communication is older than 15 minutes for queue processing
    },

    // check if the summarization is allowed for the communication
    isSummarizationAllowed (communication) {
      return communication.has_transcription &&
             this.isOlderThan(communication.created_at, 15) // check if the communication is older than 15 minutes for queue processing
    },

    // checks if a given timestamp is older than the specified number of minutes
    isOlderThan (timestamp, minutes) {
      if (!timestamp) return false

      const serverTimeFormat = 'YYYY-MM-DD HH:mm:ss'
      const serverTimeZone = 'UTC'

      // Parse the timestamp in the given format and timezone
      const serverTime = moment.tz(timestamp, serverTimeFormat, serverTimeZone)

      // Current time in the same timezone
      const now = moment.tz(moment.tz.guess())
      return now.diff(serverTime, 'minutes') >= minutes
    }
  }
}
