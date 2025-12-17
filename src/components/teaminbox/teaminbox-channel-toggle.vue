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

    <div class="filter-wrapper ml-2">
      <compact-btn borderless
                   customClass="pl-0 pr-0 fs-14 _500 position-relative text-grey-90 not-focusable filter-toggle-button"
                   id="teaminbox-channel-toggle-filter-btn"
                   data-testid="teaminbox-channel-toggle-filter-btn"
                   @clicked="onClickFilterButton">
        <b-tooltip custom-class="talk-table__tooltip"
                   placement="bottom"
                   triggers="hover"
                   target="teaminbox-channel-toggle-filter-btn"
                   v-if="!isMobile">
          Open filters
        </b-tooltip>
        <filter-icon color="#62666E"
                     class="filter-icon"
                     data-testid="teaminbox-channel-toggle-filter-icon">
        </filter-icon>
      </compact-btn>
    </div>
  </div>
</template>

<script>
import { THREADED, UNTHREADED } from 'src/store/teaminbox/teaminbox.store'
import { mapActions, mapState } from 'vuex'
import InformationCircleIcon from 'components/icons/information-circle-icon.vue'
import FilterIcon from 'components/icons/filter-icon'
import CompactBtn from 'components/compact-btn'
import { navigationErrorHandler } from 'src/router/routes'

export default {
  components: {
    InformationCircleIcon,
    FilterIcon,
    CompactBtn
  },

  mounted () {
    this.initializeViewModeFilter()
  },

  computed: {
    ...mapState('TeamInbox', [
      'viewMode'
    ]),
    ...mapState(['isMobile']),

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

      this.setViewMode(value)
      this.$emit('channel', value)
    },

    validateViewMode (value) {
      return [THREADED, UNTHREADED].includes(value)
    },

    parseUrlViewMode (viewMode) {
      return viewMode === 'Unthreaded' ? UNTHREADED : THREADED
    },

    initializeViewModeFilter () {
      // Initialize from URL if available
      const urlViewMode = this.$route.query.viewMode
      this.onChange(urlViewMode ? this.parseUrlViewMode(urlViewMode) : this.viewMode)
    },

    updateUrlViewMode (viewMode) {
      if (!this.validateViewMode(viewMode)) {
        return
      }

      const query = { ...this.$route.query }
      query.viewMode = viewMode === THREADED ? 'Threaded' : 'Unthreaded'
      this.$router.replace({ query }).catch(navigationErrorHandler)
    },

    onClickFilterButton () {
      this.$emit('open-filter')
    }
  },

  watch: {
    '$route.query.viewMode' (viewMode) {
      this.onChange(viewMode ? this.parseUrlViewMode(viewMode) : this.viewMode)
    }
  }
}
</script>

<style lang="scss">
.channel-toggle-wrapper {
  padding: 2px 12px;
  width: 100%;
  min-width: 200px;
  display: flex;
  align-items: center;

  .channel-toggle {
    flex: 1;

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
