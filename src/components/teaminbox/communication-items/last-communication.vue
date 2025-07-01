<template>
  <div class="last-communication">
    <div class="d-flex q-gutter-xs">
        <component class="pr-1"
                   height="22px"
                   width="22px"
                   data-testid="inbox-tasks-item-component"
                   :is="iconComponent"
                   :class="['flex-shrink-0 disposition-icon', `disposition-icon--${iconComponent}`, isLiveCallItem && 'live-call-pulse']">
        </component>
        <div class="comm-label text-grey-90 d-flex align-items-center">
          <div class="truncated-text last-communication__label"
               :class="[callStatusClass]"
               v-if="[CommunicationTypes.CALL, CommunicationTypes.FAX].includes(type)">
            {{ communicationLabel }}
          </div>

          <div :class="['truncated-text', appointmentReminderTextClass]"
               v-else
               v-html="parsedBody">
          </div>
        </div>
      </div>
  </div>
</template>

<script>
import * as CommunicationTypes from 'src/constants/communication-types'
import * as CommunicationDirection from 'src/constants/communication-direction'
import { mentionsMixin, liveCallsMixin, communicationInfoMixin } from 'src/plugins/mixins'

export default {
  mixins: [
    mentionsMixin,
    liveCallsMixin,
    communicationInfoMixin
  ],

  props: {
    dispositionStatus: {
      type: [Number, String],
      required: true
    },

    type: {
      type: [Number, String],
      required: true
    },

    direction: {
      type: [Number, String],
      required: true
    },

    callbackStatus: {
      type: [Number, String],
      required: false
    },

    body: {
      type: String,
      default: ''
    },

    isLiveCallItem: {
      type: Boolean,
      default: false
    }
  },

  data: () => ({
    CommunicationTypes,
    CommunicationDirection
  }),

  computed: {
    communicationLabel () {
      const label = this.$options.filters.fixCommDirection(this.direction) + ' ' + this.$options.filters.fixCommType(this.type)

      if (this.isParkedCall) {
        return `Parked ${label}`
      }

      if (this.isConnectedCall) {
        return `Connected ${label}`
      }

      return label
    },

    callStatusClass () {
      if (this.isParkedCall) {
        return 'call-parked-label'
      }

      if (this.isConnectedCall) {
        return 'call-connected-label'
      }

      return ''
    },

    appointmentReminderTextClass () {
      const appointmentReminderType = [CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER]

      return [appointmentReminderType.includes(this.type) ? 'pt-1' : '']
    },

    hasSmsBody () {
      return this.type === CommunicationTypes.SMS && this.body.length > 0
    },

    parsedBody () {
      return this.type === CommunicationTypes.NOTE
        ? this.parseMentionToView(this.body)
        : this.body
    },

    iconComponent () {
      return this.stateToIcon(this.dispositionStatus, this.type, this.direction, this.callbackStatus)
    }
  }
}
</script>

<style scoped lang="scss">
.last-communication {
  font-size: 12px;
  font-weight: 500;

  &__label {
    font-size: 12px;
  }
}

.disposition-icon {
  border-radius: 50%;
  padding: 3px;

  &[class*="completed"],
  &[class*="answered"] {
    background-color: rgba(#00BF4A, 0.1);
  }

  &[class*="missed"],
  &[class*="failed"],
  &[class*="voicemail"]{
    background-color: rgba(#FA003F, 0.1);
  }

  &[class*="abandoned"] {
    background-color: rgba(#9C27BB, 0.1);
  }

  &[class*="inprogress"] {
    background-color: rgba(#4450C0, 0.1);
  }

  &[class*="callback-pending"] {
    background-color: rgba(156,39,187, 0.1);
  }

  &[class*="deadend"] {
    background-color: rgba(#F6D047, 0.1);
  }
}
</style>
