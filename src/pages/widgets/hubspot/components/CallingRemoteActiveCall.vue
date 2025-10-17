<template>
  <div class="active-call-widget bg-dark d-flex flex-column">
    <div class="phone-header d-flex justify-content-center align-items-center flex-grow-0">
      <div class="d-flex flex-row text-xs text-white align-items-center">
        <q-badge
          color="green-6"
          class="status-badge q-mr-sm"
        />
        <span>Active Call</span>
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

      <div class="phone-status d-flex flex-column align-items-center justify-content-center" style="gap: 8px;">
        <span class="text-size-xs text-grey-82">Call is active in calling window</span>
        <span class="text-size-xs text-grey-82">Use the calling window to manage this call</span>
      </div>
    </div>
  </div>
</template>

<script>
import PersonIcon from 'components/icons/person-icon'

export default {
  name: 'CallingRemoteActiveCall',

  components: {
    PersonIcon
  },

  props: {
    contactName: {
      type: String,
      default: 'Unknown Contact'
    },
    phoneNumber: {
      type: String,
      default: ''
    },
    companyName: {
      type: String,
      default: ''
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
.active-call-widget {
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

.status-badge {
  border-radius: 50%;
  width: 8px;
  height: 8px;
  min-width: 8px;
  min-height: 8px;
  padding: 0;
  display: inline-block;
}
</style>
