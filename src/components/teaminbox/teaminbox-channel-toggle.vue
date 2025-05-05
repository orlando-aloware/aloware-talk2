<template>
  <div class="channel-toggle-wrapper d-flex align-items-center">
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
                                   :id="`teaminbox-channel-${option.slot}`"/>

          <b-tooltip custom-class="talk-table__tooltip"
                     :target="`teaminbox-channel-${option.slot}`">
            {{ option.description }}
          </b-tooltip>
        </div>
      </template>
    </q-btn-toggle>
  </div>
</template>

<script>
import { THREADED, UNTHREADED } from 'src/store/teaminbox/teaminbox.store'
import { mapActions, mapState } from 'vuex'
import InformationCircleIcon from 'components/icons/information-circle-icon.vue'
import { navigationErrorHandler } from 'src/router/routes'

export default {
  components: {
    InformationCircleIcon
  },

  mounted () {
    this.initializeViewModeFilter()
  },

  computed: {
    ...mapState('TeamInbox', [
      'viewMode'
    ]),

    ...mapState('auth', ['profile']),

    localStorageCacheKey () {
      return `teaminbox_view_mode_${this.profile.id}_${this.profile.company_id}`
    },

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
    ...mapActions('TeamInbox', ['setViewMode']),

    onChange (value) {
      this.updateUrlViewMode(value)

      if (!this.validateViewMode(value)) {
        return
      }

      if (value === this.viewMode) {
        return
      }

      this.setViewMode({ value, storageKey: this.localStorageCacheKey })
      this.$emit('channel', value)
    },

    validateViewMode (value) {
      return [THREADED, UNTHREADED].includes(value)
    },

    initializeViewModeFilter () {
      // Initialize from URL if available
      const urlViewMode = this.$route.query.viewMode
      if (urlViewMode) {
        const viewMode = urlViewMode === 'threaded' ? THREADED : UNTHREADED
        this.onChange(viewMode)
        return
      }

      // If no URL parameter, check localStorage
      const storedViewMode = localStorage.getItem(this.localStorageCacheKey)
      if (storedViewMode) {
        const viewMode = parseInt(storedViewMode)
        this.onChange(viewMode)
      }
    },

    updateUrlViewMode (viewMode) {
      if (!this.validateViewMode(viewMode)) {
        return
      }

      const query = { ...this.$route.query }
      query.viewMode = viewMode === THREADED ? 'threaded' : 'unthreaded'
      this.$router.replace({ query }).catch(navigationErrorHandler)
    }
  },

  watch: {
    '$route.query.viewMode' (viewMode) {
      if (!viewMode) {
        // if the viewMode is not set in the URL, use the current viewMode and update the URL
        this.updateUrlViewMode(this.viewMode)
      }
    }
  }
}
</script>

<style lang="scss">
.channel-toggle-wrapper {
  padding: 2px 16px;
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
