import { mapState } from 'vuex'
import { communicationInfoMixin } from 'src/plugins/mixins'
import moment from 'moment-timezone'
import * as TranscriptionStatus from 'src/constants/transcription-status'
import * as SummaryStatus from 'src/constants/summary-status'

export default {
  mixins: [communicationInfoMixin],

  components: {
    TranscriptionStatus
  },

  computed: {
    ...mapState('cache', ['currentCompany'])
  },

  methods: {
    // check if the transcription is allowed for the communication
    isTranscriptionAllowed (communication) {
      return communication.is_eligible_for_transcribe &&
             this.showAudio(communication) &&
             !communication.metadata?.transcription_info &&
             !communication.call_transcription_status
    },

    // check if the summarization is allowed for the communication
    isSummarizationAllowed (communication) {
      return communication.has_transcription &&
             communication.call_summary_status !== SummaryStatus.STATUS_QUEUED &&
             communication.call_summary_status !== SummaryStatus.STATUS_PROCESSING
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
