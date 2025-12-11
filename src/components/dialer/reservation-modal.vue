<template>
  <b-toast solid
           auto-hide-delay="30000"
           :toast-class="toastClass"
           :header-class="headerClass"
           :toaster="position"
           :no-auto-hide="true"
           id="reservation-confirmation-dialog"
           v-show="value"
           @show="onShow"
           @hide="handleHide">
    <div class="notification-body-wrapper">
      <div class="d-flex flex-row align-items-center">
        <div class="notification-icon"
             :class="notificationIconClasses">
          <inbound-call-o-icon v-if="isCall"/>
        </div>
        <div class="notification-details flex-grow-1">
          <div class="d-flex flex-grow-1 align-items-baseline w-100"
               v-if="getSource">
            <span class="mr-auto text-white pr-1 text-sm">
              {{ getSource }}
            </span>
          </div>
          <div class="d-flex flex-grow-1 align-items-baseline w-100">
            <strong class="mr-auto text-white title pr-1">
              {{ contactName }}
            </strong>
          </div>

          <!-- caller location -->
          <div class="d-flex flex-grow-1 align-items-baseline w-100"
               v-if="location">
            <span class="mr-auto text-white pr-1 text-sm">
              {{ location }}
            </span>
          </div>
        </div>

        <div class="d-flex justify-content-center align-items-center call-actions">
          <q-btn class="height-32 mr-2"
                 ripple
                 round
                 no-caps
                 @click="handleCancel">
            <cancel-call-icon width="32"
                              height="32"/>
            <q-tooltip anchor="top middle"
                       self="center middle">
              Reject
            </q-tooltip>
          </q-btn>
          <q-btn class="height-32"
                 ripple
                 round
                 no-caps
                 @click="handleOk">
            <q-tooltip anchor="top middle"
                       self="center middle">
              Accept
            </q-tooltip>
            <accept-call-icon width="32" height="32"/>
          </q-btn>
        </div>
      </div>
    </div>
  </b-toast>
</template>

<script>
import AcceptCallIcon from 'components/icons/accept-call-icon'
import CancelCallIcon from 'components/icons/cancel-call-icon'
import InboundCallOIcon from 'components/icons/inbound-call-o-icon'
import { notificationMixin } from 'src/plugins/mixins'

export default {
  name: 'ReservationModal',

  mixins: [
    notificationMixin
  ],

  components: {
    AcceptCallIcon,
    CancelCallIcon,
    InboundCallOIcon
  },

  props: {
    value: {
      type: Boolean,
      default: false
    },
    contactName: {
      type: String,
      default: ''
    },
    reservationType: {
      type: String,
      default: 'call'
    },
    position: {
      type: String,
      default: 'b-toaster-top-center'
    },
    location: {
      type: String,
      default: ''
    }
  },

  computed: {
    isCall () {
      return true
    },

    toastClass () {
      return 'action-notification notification-border-round bg-blue-60-opaque position-relative background-blur incoming-call-notification'
    },

    headerClass () {
      return 'border-0 p-0 bg-blue-60-opaque'
    },

    notificationIconClasses () {
      return []
    },

    getSource () {
      // Transform reservationType like 'inbound_call' to 'Inbound Call'
      if (!this.reservationType) {
        return ''
      }
      return this.reservationType
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    },

    reservationMessage () {
      return `Do you want to accept this ${this.reservationType} reservation?`
    }
  },

  methods: {
    handleOk () {
      this.$emit('accepted')
      this.$emit('input', false)
    },

    handleCancel () {
      this.$emit('rejected')
      this.$emit('input', false)
    },

    handleHide () {
      this.$emit('hidden')
      console.log('Hide reservation')
      this.stopAudio()
    },

    onShow () {
      console.log('Show reservation')
      this.playAudio(true)
    }
  }
}
</script>

<style scoped>
.notification-body-wrapper {
  cursor: pointer;
}

.notification-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.notification-details {
  min-width: 0;
}

.title {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.2;
}

.message-body {
  margin-top: 4px;
}

.message-text {
  font-size: 14px;
  line-height: 1.4;
}

.call-actions {
  margin-left: 12px;
  flex-shrink: 0;
}

.height-32 {
  height: 32px;
  min-width: 32px;
}

.text-white {
  color: #ffffff !important;
}

.text-grey-82 {
  color: #d1d5db !important;
}

.text-grey-81 {
  color: #9ca3af !important;
}

.bg-blue-60-opaque {
  background-color: rgba(59, 130, 246, 0.8) !important;
}

.background-blur {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.notification-border-round {
  border-radius: 12px;
}

.incoming-call-notification {
  border: 1px solid rgba(59, 130, 246, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
