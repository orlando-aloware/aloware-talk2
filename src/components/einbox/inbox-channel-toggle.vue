<template>
  <div class="channel-toggle-wrapper d-flex align-items-center w-100 p-0 m-0">
    <q-btn-toggle
      class="channel-toggle w-100"
      no-caps
      rounded
      unelevated
      toggle-color="primary"
      color="grey-3"
      text-color="grey-8"
      spread
      :options="[
        {label: 'Calls', value: CALLS_TYPE},
        {label: 'Messages', value: SMS_TYPE}
      ]"
      :value="communicationType"
      @input="onChange"
    />
  </div>
</template>

<script>
import { CALLS_TYPE, SMS_TYPE } from 'src/store/einbox/einbox.store'
import { mapActions, mapState } from 'vuex'
import EinboxMixin from 'src/plugins/mixins/einbox.mixin'

export default {
  name: 'InboxChannelToggle',

  mixins: [EinboxMixin],

  data () {
    return {
      CALLS_TYPE,
      SMS_TYPE
    }
  },

  computed: {
    ...mapState('Einbox', ['communicationType', 'activeInbox'])
  },

  methods: {
    ...mapActions('Einbox', ['setCommunicationType']),

    onChange (value) {
      this.setCommunicationType(value)
      if (this.activeInbox) {
        this.resetCommunications()
        this.fetchCommunications(this.activeInbox)
      }
    }
  }
}
</script>

<style lang="scss">
.channel-toggle-wrapper {
  padding: 8px 16px;

  .channel-toggle {
    .q-btn {
      min-height: 28px;
      padding: 2px 24px;
      font-size: 14px;
      font-weight: 500;
    }

    .q-btn--active {
      font-weight: 600;
    }
  }
}
</style>
