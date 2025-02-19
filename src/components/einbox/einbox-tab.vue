<template>
  <div class="einbox-tab d-flex flex-column">
    <inbox-channel-toggle />

    <!-- Items List -->
    <div class="items-list blue-scroll"
         @scroll="onScroll">
      <!-- Initial loading state -->
      <div :class="[isLoadingItems ? 'py-5' : 'py-4', 'relative']"
           v-if="isLoadingItems">
        <b-overlay rounded="sm"
                   variant="white"
                   data-testid="items-list-overlay"
                   :show="isLoadingItems">
          <template #overlay>
            <div class="text-center">
              <q-spinner-bars color="primary"
                              size="2em" />
            </div>
          </template>
        </b-overlay>
      </div>

      <!-- items list -->
      <template v-else-if="items.length">
        <div :key="item.id"
             v-for="item in filteredItems"
             @click="onItemClick(item)">
          <!-- Threaded view -->
          <communication :contact-id="item.id"
                         :contact-name="item.name"
                         :disposition-status="item.last_communication_disposition_status2"
                         :type="item.last_communication_type"
                         :direction="item.last_communication_direction"
                         :callback-status="item.last_communication_callback_status"
                         :body="item.last_communication_body"
                         :current-status="item.last_communication_current_status2"
                         :date="item.last_communication_at"
                         :total-unreads="item.unread_comms"
                         :is-active="activeId === item.id"
                         v-if="viewMode === THREADED" />

          <!-- Unthreaded View -->
          <communication :contact-id="item.contact_id"
                         :contact-name="getContactName(item.contact || {})"
                         :disposition-status="item.disposition_status2"
                         :type="item.type"
                         :direction="item.direction"
                         :callback-status="item.callback_status"
                         :body="item.body"
                         :current-status="item.current_status2"
                         :date="item.created_at"
                         :total-unreads="0"
                         :is-active="activeId === item.id"
                         :repeats="item.repeats"
          v-else-if="viewMode === UNTHREADED" />
        </div>

        <!-- Load more indicator -->
        <div class="text-center q-pa-sm"
             v-if="isLoadingMoreItems || isLoadingItems">
          <q-spinner-dots color="primary"
                          size="2em" />
        </div>
      </template>

      <!-- Empty state -->
      <div class="text-center q-pa-md text-grey"
           v-else>
        Empty Inbox
      </div>
    </div>
  </div>
</template>

<script>
import Communication from 'src/components/einbox/communication-items/communication.vue'
import InboxChannelToggle from './inbox-channel-toggle.vue'
import { helperMixin, EinboxMixin } from 'src/plugins/mixins'
import { mapState } from 'vuex'
import { THREADED, UNTHREADED } from 'src/store/einbox/einbox.store'
import { debounce } from 'lodash'

export default {
  components: {
    Communication,
    InboxChannelToggle
  },

  mixins: [
    EinboxMixin,
    helperMixin
  ],

  data () {
    return {
      activeId: null,
      THREADED,
      UNTHREADED
    }
  },

  computed: {
    ...mapState('Einbox', [
      'items',
      'isLoadingItems',
      'isLoadingMoreItems',
      'hasMoreItems',
      'activeInbox',
      'viewMode'
    ]),

    filteredItems () {
      return this.items.filter(item => !item.hidden)
    }
  },

  created () {
    // Create debounced version of the scroll handler
    this.debouncedScroll = debounce(this.handleScroll, 300)
  },

  beforeDestroy () {
    // Clean up the debounced function
    if (this.debouncedScroll) {
      this.debouncedScroll.cancel()
    }
  },

  methods: {
    onScroll ({ target }) {
      this.debouncedScroll(target)
    },

    handleScroll (target) {
      const bottomThreshold = 100
      const isNearBottom = target.scrollHeight - (target.scrollTop + target.clientHeight) <= bottomThreshold

      if (isNearBottom && !this.isLoadingMoreItems && !this.isLoadingItems && this.hasMoreItems) {
        this.loadMoreItems(this.activeInbox)
      }
    },

    onItemClick (item) {
      this.activeId = item.id
      const contactId = this.viewMode === THREADED ? item.id : item.contact_id
      const route = `/einbox/${this.activeInbox}/contacts/${contactId}/communications`

      // avoid redundant navigation
      if (route === this.$route.path) {
        return
      }

      this.$router.push(route)
    }
  },

  watch: {
    '$route.params.id': {
      immediate: true,
      handler (newV) {
        if (this.viewMode === THREADED) {
          this.activeId = newV ? parseInt(newV) : null
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.einbox-tab {
  height: 100%;
  width: 100%;
  background-color: white;
  border-radius: inherit;
}

.items-list {
  flex: 1;
  overflow-y: auto;
}
</style>
