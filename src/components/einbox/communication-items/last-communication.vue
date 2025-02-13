<template>
  <div class="last-communication">
    <div class="d-flex">
        <div class="pr-2">
          <component height="18px"
                     width="18px"
                     data-testid="inbox-tasks-item-component"
                     :is="stateToIcon(dispositionStatus, type, direction, callbackStatus)">
          </component>
        </div>
        <div class="comm-label text-grey-90 d-flex align-items-center">
          <div class="truncated-text last-communication__label"
               :class="[callStatusClass]"
               :id="`last-comm-icon-${_uid}`"
               v-if="[CommunicationTypes.CALL, CommunicationTypes.FAX].includes(type)">
            <b-tooltip data-testid="inbox-tasks-item-tooltip"
                       custom-class="talk-table__tooltip"
                       triggers="hover"
                       :target="`last-comm-icon-${_uid}`">
              {{ communicationLabel }}
            </b-tooltip>
            {{ communicationLabel }}
          </div>

          <div class="truncated-text"
               :class="[appointmentReminderTextClass]"
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

    totalUnreads: {
      type: [Number, String],
      required: true
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
    }
  }
}
</script>

<style scoped lang="scss">
.last-communication {
  font-size: 14px;
  font-weight: 500;
  width: 195px;

  &__label {
    font-size: 12px;
  }
}
</style>
