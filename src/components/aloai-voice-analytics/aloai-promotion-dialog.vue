<template>
  <q-dialog v-model="internalDialogVisible">
    <div class="ai-info-box">
      <div class="ai-info-box-header">
        <span class="ai-info-box-icon">🎁</span>
        <span class="ai-info-box-title">
          {{ modalContent.title }}
        </span>
      </div>
      <p class="ai-info-box-content text-white">
        {{ modalContent.message }}
      </p>
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

  emits: ['sendButtonTitle', 'update:dialogVisible'],

  data () {
    return {
      internalDialogVisible: this.dialogVisible
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany']),
    ...mapState('auth', ['profile']),

    includedMinutes () {
      return this.currentCompany?.plan?.included_transcription_min || 0
    },

    usedMinutes () {
      return this.currentCompany?.used_transcription_min || 0
    },

    transcriptionRate () {
      return this.currentCompany?.transcription_settings?.transcription_rate || '0.03'
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

    modalContent () {
      // Centralized modal logic based on conditions
      if (!this.transcriptionEnabled) {
        return {
          title: `You’ve used all ${this.includedMinutes} minutes included in your plan for AloAi Voice Analytics. As a result, call transcription and summaries have been deactivated.`,
          message: `To reactivate these features, you can upgrade your plan to include more minutes and continue enjoying the full benefits of our AI-powered services.`
        }
      }

      if (this.isTrial) {
        return {
          title: `You currently have ${this.includedMinutes} minutes included in your plan for AloAi Voice Analytics. Our AI engine will transcribe, analyze, and summarize your calls effortlessly. Simply navigate to any contact you've called to see it in action.`,
          message: `Need more minutes to keep up with your growing needs? Upgrade your plan now for additional minutes and enhanced features.`
        }
      }

      if (this.usagePercentage >= 80 && this.usagePercentage < 100) {
        return {
          title: `You’ve almost reached the limit of your ${this.includedMinutes} minutes included in your plan for AloAi Voice Analytics. Our AI engine has been working hard to transcribe, analyze, and summarize your calls, helping you get the most out of every conversation.`,
          message: `To avoid interruptions in service, consider upgrading your plan for more minutes and additional features tailored to meet your growing needs.`
        }
      }

      if (this.usedMinutes >= this.includedMinutes) {
        return {
          title: `You’ve used all ${this.includedMinutes} minutes included in your plan for AloAi Voice Analytics. But don’t worry — you can continue using the service! After your free minutes, each transcription minute will cost just $${Number(this.profile.rate?.transcription?.toFixed(2))} (${Math.round(this.profile?.rate?.transcription * 100)} cents/min).`,
          message: `To keep benefiting from uninterrupted service, you also have the option to upgrade your plan for more included minutes and additional features.`
        }
      }

      return {
        title: `You currently have ${this.includedMinutes} minutes included in your plan for AloAi Voice Analytics. Our AI engine will transcribe, analyze, and summarize your calls effortlessly. Simply navigate to any contact you've called to see it in action.`,
        message: `Need more minutes to keep up with your growing needs? Upgrade your plan now for additional minutes and enhanced features.`
      }
    },

    buttonTitle () {
      return this.transcriptionEnabled ? 'AI Engine Ready' : 'AI Engine Off'
    }
  },

  watch: {
    dialogVisible (newVal) {
      this.internalDialogVisible = newVal // Sync from parent
    },
    internalDialogVisible (newVal) {
      this.$emit('update:dialogVisible', newVal) // Sync to parent
    },
    buttonTitle: {
      immediate: true,
      handler (newTitle) {
        this.$emit('sendButtonTitle', newTitle)
      }
    }
  }
}
</script>
