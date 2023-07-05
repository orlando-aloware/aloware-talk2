<template>
  <b-alert show
           variant="warning">
    <div class="mb-3">An admin has restricted broadcasts to only be sent during:</div>
    <div class="d-flex flex-row align-items-center ">
      <div class="mr-2">
        <b>{{ broadcastOperatingHoursText }}</b>
      </div>

      <b-badge class="mr-2"
               variant="light">
        {{ companyTimezone }}
      </b-badge>

      <a target="_blank"
         :href="getBroadcastSettingURL()"
         v-if="hasRole('Company Admin')">
        <pencil-o-icon />
        <q-tooltip>
          Edit Broadcast time restriction
        </q-tooltip>
      </a>
    </div>
  </b-alert>
</template>

<script>
import PencilOIcon from 'src/components/icons/pencil-o-icon.vue'
import { aclMixin, classicMixin } from 'src/plugins/mixins'
import { mapState } from 'vuex'

export default {
  mixins: [
    aclMixin,
    classicMixin
  ],

  components: {
    PencilOIcon
  },

  computed: {
    ...mapState('cache', [
      'currentCompany'
    ]),

    broadcastOperatingHoursText () {
      const open = this.getCurrentDate + ' ' + this.currentCompany.broadcast_open
      const close = this.getCurrentDate + ' ' + this.currentCompany.broadcast_close

      return window.moment(open).format('h:mm A') + ' - ' + window.moment(close).format('h:mm A')
    },

    getCurrentDate () {
      return this.companyDate.format('MM/DD/YYYY')
    },

    companyDate () {
      return window.moment(this.utcDate).tz(this.currentCompany.timezone)
    },

    utcDate () {
      return window.moment().tz('UTC')
    },

    companyTimezone () {
      return window.moment().tz(this.currentCompany.timezone).format('z')
    }
  }
}
</script>
