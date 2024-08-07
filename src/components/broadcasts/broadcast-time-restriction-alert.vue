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
        {{ companyTimezone.format('z') }}
      </b-badge>

      <a target="_blank"
         :href="getBroadcastSettingURL()"
         v-if="hasRole('Company Admin') && !isSimpSocial">
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
import { aclMixin, classicMixin, companyTimezone, simpsocialMixin } from 'src/plugins/mixins'

export default {
  name: 'broadcast-time-restriction-alert',

  mixins: [
    aclMixin,
    classicMixin,
    companyTimezone,
    simpsocialMixin
  ],

  components: {
    PencilOIcon
  }
}
</script>
