<template>
  <q-dialog v-model="dialogVisible">
    <div class="ai-info-box">
      <div class="ai-info-box-header">
        <span class="ai-info-box-icon">🎁</span>
      </div>
      <p class="ai-info-box-content">
        {{ modalMessage }}
      </p>
      <div v-if="additionalMessage" class="ai-info-box-content">
        {{ additionalMessage }}
      </div>
      <div class="ai-info-box-links">
        <strong>Guides:</strong>
          <ul class="pl-4">
            <li>
              <a href="https://support.aloware.com/en/articles/10233960-guide-for-agents-using-aloai-voice-analytics" target="_blank">
                Agents guide to AloAi Voice Analytics
              </a>
            </li>
            <li>
              <a href="https://support.aloware.com/en/articles/10235067-guide-for-admins-using-aloai-voice-analytics" target="_blank">
                Admins guide to AloAi Voice Analytics
              </a>
            </li>
          </ul>
          Revolutionize your calls with AloAI Voice Analytics; read the
            <a href="https://aloware.com/blog/aloai-voice-analytics-announcement" target="_blank">
              blog post
            </a>
            to learn more!
        </div>
    </div>
  </q-dialog>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'aloai-promotion-dialog',

  props: {
    dialogVisible: {
      type: Boolean,
      required: true
    }
  },

  emits: ['sendModalTitle', 'update:dialogVisible'],

  computed: {
    ...mapState('cache', ['currentCompany']),

    includedMinutes () {
      return this.currentCompany?.plan?.included_transcription_min || 0
    },

    usedMinutes () {
      return this.currentCompany?.used_transcription_min || 0
    },

    isTrial () {
      return this.currentCompany?.transcription_settings?.is_trial
    },

    transcriptionEnabled () {
      return this.currentCompany?.transcription_settings?.call_transcription_enabled
    },

    usagePercentage () {
      if (this.includedMinutes === 0) return 0
      return (this.usedMinutes * 100) / this.includedMinutes
    },

    modalTitle () {
      if (!this.transcriptionEnabled) return 'AI Engine Off'
      return 'AI Engine Ready'
    },

    modalMessage () {
      if (!this.transcriptionEnabled) {
        return this.isTrial
          ? 'Call transcription and summaries have been deactivated. Upgrade your plan to continue enjoying these features.'
          : `You’ve used all ${this.includedMinutes} minutes included in your plan. Upgrade to reactivate features.`
      }

      if (this.isTrial) {
        return `Your AloAi Voice Analytics is Active! You currently have ${this.includedMinutes} minutes included in your plan.`
      }

      if (this.usagePercentage >= 80) {
        return `You’ve almost reached the limit of your ${this.includedMinutes} minutes. Upgrade to avoid interruptions.`
      }

      if (this.usedMinutes >= this.includedMinutes) {
        const rate = this.currentCompany?.transcription_settings?.transcription_rate || '0.03'
        return `You’ve used all ${this.includedMinutes} minutes. Each transcription minute will cost ${rate} cents. Upgrade for more minutes.`
      }

      return `Your AloAi Voice Analytics is Active! You have ${this.includedMinutes} minutes included.`
    },

    additionalMessage () {
      if (this.usagePercentage >= 80) {
        return 'Our AI engine has been helping you get the most out of every conversation. Upgrade for additional minutes.'
      }
      return null
    }
  },
  watch: {
    modalTitle: {
      immediate: true,
      handler (newTitle) {
        this.$emit('sendModalTitle', newTitle)
      }
    }
  }
}
</script>
