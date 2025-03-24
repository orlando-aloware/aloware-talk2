<template>
  <div class="channel-toggle-wrapper d-flex align-items-center border-bottom">
    <q-btn-toggle class="channel-toggle"
                  no-caps
                  rounded
                  unelevated
                  toggle-color="primary"
                  color="grey-3"
                  text-color="grey-8"
                  spread
                  :options="options"
                  :value="viewMode"
                  @input="onChange">
      <template #[option.slot]
                v-for="option in options">
        <div class="d-flex align-items-center"
             :key="option.slot">
          <span>{{ option.text }}</span>

          <information-circle-icon height="16"
                                   width="16"
                                   class="ml-1"
                                   :color="viewMode === option.value ? '#fff' : '#256eff'"
                                   :id="`einbox-channel-${option.slot}`"/>

          <b-tooltip custom-class="talk-table__tooltip"
                     :target="`einbox-channel-${option.slot}`">
            {{ option.description }}
          </b-tooltip>
        </div>
      </template>
    </q-btn-toggle>
  </div>
</template>

<script>
import EinboxMixin from 'src/plugins/mixins/einbox.mixin'
import { THREADED, UNTHREADED } from 'src/store/einbox/einbox.store'
import { mapActions, mapState } from 'vuex'
import InformationCircleIcon from 'components/icons/information-circle-icon.vue'

export default {
  mixins: [
    EinboxMixin
  ],

  components: {
    InformationCircleIcon
  },

  computed: {
    ...mapState('Einbox', [
      'viewMode',
      'activeInboxId'
    ]),

    options () {
      return [
        {
          text: 'Threaded',
          slot: 'one',
          value: THREADED,
          description: 'View all messages and calls grouped by contact, making it easy to follow conversations in one place'
        },
        {
          text: 'Unthreaded',
          slot: 'two',
          value: UNTHREADED,
          description: 'See all messages and calls in chronological order, essentially a communication log'
        }
      ]
    }
  },

  methods: {
    ...mapActions('Einbox', ['setViewMode']),

    onChange (value) {
      this.setViewMode(value)

      if (this.activeInboxId) {
        this.resetItems()
        this.fetchItems(this.activeInboxId)
      }
    }
  }
}
</script>

<style lang="scss">
.channel-toggle-wrapper {
  padding: 8px 16px;
  width: 100%;
  min-width: 200px;

  .channel-toggle {
    width: 100%;

    .q-btn {
      min-height: 28px;
      padding: 2px 24px;
      font-size: 14px;
      font-weight: 500;
    }

    .q-btn[aria-pressed="false"] {
      color: #256eff !important;
    }
  }
}
</style>
