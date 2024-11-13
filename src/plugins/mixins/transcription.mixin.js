import { mapState } from 'vuex'
import * as CommunicationTypes from 'src/constants/communication-types'
import { communicationInfoMixin } from 'src/plugins/mixins'

export default {
  mixins: [communicationInfoMixin],

  computed: {
    ...mapState('cache', ['currentCompany'])
  },

  methods: {
    isTranscriptionAllowed (communication) {
      return this.isTranscriptionEnabled &&
             communication.type === CommunicationTypes.CALL &&
             this.showAudio(communication) &&
             !communication.metadata?.transcription_info
    },
    isTranscriptionEnabled () {
      return this.currentCompany?.transcription_settings?.call_transcription_enabled &&
             this.currentCompany?.transcription_enabled
    }
  }
}
