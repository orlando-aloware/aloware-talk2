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
                Revolutionize your calls with AloAi Voice Analytics; read the
                <a href="https://aloware.com/blog/aloai-voice-analytics-announcement" target="_blank">
                    blog post
                </a>
                to learn more!
                <div v-if="isAnyCallRecordingDisabled">
                    <br>
                    <span class="mr-1">⚠️</span>
                    <strong v-if="isAllCallRecordingDisabled">You’re currently not recording any calls. To take advantage of our AloAi Voice Analytics product, turn on call recordings:</strong>
                    <strong v-else>You’re currently not recording all your calls. To take advantage of our AloAi Voice Analytics product, turn on call recordings:</strong>
                    <ul class="pl-4">
                        <li>
                            <span>For inbound call recordings: </span>
                            <a :href="inboundCallRecordingUrl" target="_blank">Link</a>
                        </li>
                        <li>
                            <span>For outbound call recordings: </span>
                            <a :href="outboundCallRecordingUrl" target="_blank">Link</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </q-dialog>
</template>

<script>
import { mapState } from 'vuex'
import * as InboundCallRecordingModes from 'src/constants/inbound-call-recording-modes'
import * as OutboundCallRecordingModes from 'src/constants/outbound-call-recording-modes'

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
      return this.profile?.rate?.transcription
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
          // If the plan is not an AI plan, hide cost-related and plan-specific messages.
          if (!this.currentCompany?.plan?.ai_plan) {
            return {
              title: `You’ve used all ${this.includedMinutes} trial minutes, but don’t worry! You can easily purchase additional transcription minutes by reaching out to our CSM team, you can upgrade your plan to include more minutes and unlock additional features.`,
              message: `To ensure uninterrupted access and additional benefits, consider upgrading your plan for more included minutes and enhanced features.`
            }
          }
          // If the plan is an AI plan, show cost-related messages.
          return {
            title: `You’ve used all ${this.includedMinutes} minutes included in your AloAi Voice Analytics plan. But don’t worry — you can continue using the service! After your free minutes, each transcription minute will cost just ${Math.round(Number(this.transcriptionRate) * 100)} cents/min.`,
            message: `To keep benefiting from uninterrupted service, you also have the option to upgrade your plan for more included minutes and additional features.`
          }
        }

        return {
          title: `You’ve reached the ${this.includedMinutes} minutes included in your AloAi Voice Analytics plan. However, with Overusage Billing Restriction disabled, you can continue using the service seamlessly. Additional transcription minutes will be charged at just ${Math.round(Number(this.transcriptionRate) * 100)} cents/min.`,
          message: `To ensure uninterrupted access and additional benefits, consider upgrading your plan for more included minutes and enhanced features.`
        }
      }

      return {
        title: `You currently have ${this.includedMinutes} minutes included in your AloAi Voice Analytics plan. Our AI engine will transcribe, analyze, and summarize your calls effortlessly. Simply navigate to any contact you've called to see it in action.`,
        message: `Need more minutes to keep up with your growing needs? Upgrade your plan now for additional minutes and enhanced features.`
      }
    },

    outboundCallRecordingUrl () {
      return `${process.env.API_URL}/account?tab=calling-settings#outbound_call_recording_mode`
    },

    inboundCallRecordingUrl () {
      return `${process.env.API_URL}/account?tab=calling-settings#inbound_call_recording_mode`
    },

    isAllCallRecordingDisabled () {
      return (
        this.currentCompany?.inbound_call_recording_mode === InboundCallRecordingModes.INBOUND_CALL_RECORDING_MODE_NEVER &&
        this.currentCompany?.outbound_call_recording_mode === OutboundCallRecordingModes.OUTBOUND_CALL_RECORDING_MODE_NEVER
      )
    },

    isAnyCallRecordingDisabled () {
      return (
        this.currentCompany?.inbound_call_recording_mode === InboundCallRecordingModes.INBOUND_CALL_RECORDING_MODE_NEVER ||
        this.currentCompany?.outbound_call_recording_mode === OutboundCallRecordingModes.OUTBOUND_CALL_RECORDING_MODE_NEVER
      )
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
