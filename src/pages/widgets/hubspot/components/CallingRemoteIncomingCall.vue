<template>
  <div class="incoming-call-widget bg-dark d-flex flex-column">
    <div class="phone-header d-flex justify-content-center align-items-center flex-grow-0">
      <div class="d-flex flex-row text-xs text-white">
        <span>Incoming Call</span>
      </div>
    </div>

    <div class="phone-body d-flex flex-column flex-grow-1 align-items-center justify-content-around">
      <div class="phone-info d-flex flex-column align-items-center">
        <person-icon />

        <div class="text-white text-center">
          <q-item-label class="text-size-xxl _600 mt-2 d-flex align-items-center justify-content-center">
            <span class="d-inline-flex">
              {{ contactName }}
            </span>
          </q-item-label>
          <q-item-label class="text-size-sm _400 mt-1 d-flex align-items-center justify-content-center">
            <span class="d-inline-flex">{{ formattedPhoneNumber }}</span>
          </q-item-label>
          <q-item-label class="text-size-sm _400 mt-1" v-if="companyName">
            {{ companyName }}
          </q-item-label>
        </div>
      </div>

      <div class="phone-status d-flex justify-content-center">
        <span class="text-size-xs text-grey-82">Call will open in calling window</span>
      </div>

      <div class="phone-cta">
        <div class="d-flex flex-row justify-content-center" style="gap: 48px;">
          <div class="d-flex flex-column align-items-center">
            <q-btn
              class="height-52 bg-white"
              ripple
              round
              no-caps
              :disable="isCallConnected"
              @click="$emit('decline')"
            >
              <cancel-call-icon width="52" height="52" />
            </q-btn>
            <span class="text-size-xs mt-1 text-white">Decline</span>
          </div>
          <div class="d-flex flex-column align-items-center">
            <q-btn
              class="height-52 bg-white"
              ripple
              round
              no-caps
              :disable="isCallConnected"
              @click="$emit('accept')"
            >
              <accept-call-icon width="52" height="52" />
            </q-btn>
            <span class="text-size-xs mt-1 text-white">Accept</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CancelCallIcon from 'components/icons/cancel-call-icon'
import AcceptCallIcon from 'components/icons/accept-call-icon'
import PersonIcon from 'components/icons/person-icon'

export default {
  name: 'CallingRemoteIncomingCall',

  components: {
    CancelCallIcon,
    AcceptCallIcon,
    PersonIcon
  },

  props: {
    contactName: {
      type: String,
      default: 'Unknown Caller'
    },
    phoneNumber: {
      type: String,
      default: ''
    },
    companyName: {
      type: String,
      default: ''
    },
    isCallConnected: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    formattedPhoneNumber () {
      if (!this.phoneNumber) {
        return ''
      }
      return this.$options.filters.fixPhone(this.phoneNumber, '', false, false, true)
    }
  }
}
</script>

<style scoped>
.incoming-call-widget {
  width: 100vw;
  max-width: 100%;
  height: 522px;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.phone-header {
  width: 100%;
  height: 36px;
  padding-left: 12px;
  padding-right: 12px;
  flex-shrink: 0;
}
</style>
