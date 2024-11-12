<template>
    <b-button variant="success"
                size="sm"
                data-testid="comm-details-generate-transcription-button"
                class="mr-2"
                v-if="isTranscriptionAllowed(communication)"
                @click="generateTranscription(communication.id)">
        <sparkle-icon :width="20" :height="20" color="white" style="overflow: visible"/>
        Generate Transcription
    </b-button>
  </template>
  
  <script>
  import { transcriptionMixin } from 'src/plugins/mixins'
  import { mapGetters } from 'vuex'
  import SparkleIcon from 'components/icons/ai/sparkle-bold-icon.vue'

  
  export default {
    name: 'generate-transcription-button',

    props: {
      communication: {
        type: Object,
        required: true,
      }
    },
  
    components: {
        SparkleIcon
    },
  
    mixins: [
      transcriptionMixin
    ],

  
    methods: {
        /**
         * @param {string} communicationId
         * @returns {void}
         * @description Generate transcription for the given communication.
         */
        generateTranscription (communicationId) {
        talk2Api.V1.transcription.generateTranscription(communicationId)
            .then(response => {
            const message = response.data.message || 'Transcription generation started.'
            this.$generalNotification(message, 'success')
            })
            .catch(error => {
            const errorMessage = error.response?.data?.message || 'Failed to start transcription generation.'
            console.error('Failed to generate transcription:', error)
            this.$generalNotification(errorMessage, 'error')
            })
        },
    },

  }
  </script>
  