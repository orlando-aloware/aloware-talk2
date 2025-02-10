<template>
  <div class="channel-toggle-wrapper d-flex align-items-center w-100 border-bottom">
    <q-btn-toggle class="channel-toggle w-100"
                  no-caps
                  rounded
                  unelevated
                  toggle-color="primary"
                  color="grey-3"
                  text-color="grey-8"
                  spread
                  :options="options"
                  :value="viewMode"
                  @input="onChange"
    />
  </div>
</template>

<script>
import EinboxMixin from 'src/plugins/mixins/einbox.mixin'
import { THREADED, UNTHREADED } from 'src/store/einbox/einbox.store'
import { mapActions, mapState } from 'vuex'

export default {
  mixins: [
    EinboxMixin
  ],

  computed: {
    ...mapState('Einbox', ['viewMode', 'activeInbox']),

    options () {
      return [
        { label: 'Threaded', value: THREADED },
        { label: 'Unthreaded', value: UNTHREADED }
      ]
    }
  },

  methods: {
    ...mapActions('Einbox', ['setViewMode']),

    onChange (value) {
      this.setViewMode(value)

      if (this.activeInbox) {
        this.resetItems()
        this.fetchItems(this.activeInbox)
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
