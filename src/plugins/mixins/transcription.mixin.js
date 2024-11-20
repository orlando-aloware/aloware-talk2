import { mapState } from 'vuex'
import { communicationInfoMixin } from 'src/plugins/mixins'

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
             this.isOlderThan(communication.created_at, 10) && // check if the communication is older than 10 minutes for queue processing
             !communication.metadata?.transcription_info // check if the transcription is already processed
    },

    // check if the summarization is allowed for the communication
    isSummarizationAllowed (communication) {
      return communication.is_eligible_for_transcribe &&
             this.showAudio(communication) &&
             this.isOlderThan(communication.created_at, 10) // check if the communication is older than 10 minutes for queue processing
    },

    // checks if a given timestamp is older than the specified number of minutes
    isOlderThan (createdAt, minutes) {
      if (!createdAt) return false
      const timeDifference = Date.now() - new Date(createdAt).getTime()
      return timeDifference >= minutes * 60 * 1000
    }
  }
}
