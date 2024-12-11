<template>
  <q-dialog v-model="internalDialogVisible">
    <div class="ai-info-box">
      <div class="ai-info-box-header">
        <span class="ai-info-box-icon"
              v-if="usagePercentage < 100 && isTrial">
          🎁
        </span>
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

  emits: ['update:dialogVisible'],

  data () {
    return {
      internalDialogVisible: this.dialogVisible
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany']),
    ...mapState('auth', ['profile']),

    includedMinutes () {
      return this.currentCompany?.plan?.included_transcription_min
    },

    usedMinutes () {
      return this.currentCompany?.used_transcription_min
    },

    transcriptionRate () {
      return this.currentCompany?.transcription_settings?.transcription_rate
    },

    transcriptionEnabled () {
      return this.currentCompany?.transcription_settings?.call_transcription_enabled
    },

    overusageRestrictionEnabled () {
      return this.currentCompany?.transcription_settings?.overusage_restriction_enabled
    },

    isTrial () {
      return this.currentCompany?.transcription_settings?.is_trial
    },

    usagePercentage () {
      if (this.includedMinutes === 0) return 0
      return (this.usedMinutes * 100) / this.includedMinutes
    },

    modalContent () {
      // Centralized modal logic based on conditions
      if (this.usagePercentage >= 80 && this.usagePercentage < 100) {
        return {
          title: `You’ve almost reached the limit of your ${this.includedMinutes} minutes included in your AloAi Voice Analytics plan. Our AI engine has been working hard to transcribe, analyze, and summarize your calls, helping you get the most out of every conversation.`,
          message: `To avoid interruptions in service, consider upgrading your plan for more minutes and additional features tailored to meet your growing needs.`
        }
      }

      if (this.usedMinutes >= this.includedMinutes) {
        if (this.overusageRestrictionEnabled) {
          return {
            title: `You’ve used all ${this.includedMinutes} minutes included in your AloAi Voice Analytics plan. But don’t worry — you can continue using the service! After your free minutes, each transcription minute will cost just ${Math.round(Number(this.profile?.rate?.transcription) * 100)} cents/min.`,
            message: `To keep benefiting from uninterrupted service, you also have the option to upgrade your plan for more included minutes and additional features.`
          }
        }

        return {
          title: `You’ve reached the ${this.includedMinutes} minutes included in your AloAi Voice Analytics plan. However, with Overusage Billing Restriction disabled, you can continue using the service seamlessly. Additional transcription minutes will be charged at just ${Math.round(Number(this.profile?.rate?.transcription) * 100)} cents/min.`,
          message: `To ensure uninterrupted access and additional benefits, consider upgrading your plan for more included minutes and enhanced features.`
        }
      }

      return {
        title: `You currently have ${this.includedMinutes} minutes included in your AloAi Voice Analytics plan. Our AI engine will transcribe, analyze, and summarize your calls effortlessly. Simply navigate to any contact you've called to see it in action.`,
        message: `Need more minutes to keep up with your growing needs? Upgrade your plan now for additional minutes and enhanced features.`
      }
    }
  },

  watch: {
    dialogVisible (newVal) {
      this.internalDialogVisible = newVal // Sync from parent
    },
    internalDialogVisible (newVal) {
      this.$emit('update:dialogVisible', newVal) // Sync to parent
    }
  }
}
</script>
