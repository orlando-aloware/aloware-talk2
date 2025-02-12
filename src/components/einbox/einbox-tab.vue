<template>
  <div class="einbox-tab d-flex flex-column w-100">
    <inbox-channel-toggle />

    <!-- Items List -->
    <div class="items-list"
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

      <!-- contacts list -->
      <template v-else-if="items.length">
        <div :key="contact.id"
             v-for="contact in items"
             @click="onItemClick(contact)">
          <communication :contact-id="contact.id"
                         :contact-name="contact.name"
                         :disposition-status="contact.last_communication_disposition_status2"
                         :type="contact.last_communication_type"
                         :direction="contact.last_communication_direction"
                         :callback-status="contact.last_communication_callback_status"
                         :body="contact.last_communication_body"
                         :current-status="contact.last_communication_current_status2"
                         :date="contact.last_communication_at"
                         :total-unreads="contact.unread_comms"
                         :is-active="activeContactId === contact.id"
                         v-if="viewMode === THREADED" />
          <span v-else>
            To build...
          </span>
        </div>

        <!-- Load more indicator -->
        <div class="text-center q-pa-sm"
             v-if="isLoadingMoreItems">
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
import EinboxMixin from 'src/plugins/mixins/einbox.mixin'
import InboxChannelToggle from './inbox-channel-toggle.vue'
import { mapState } from 'vuex'
import { THREADED } from 'src/store/einbox/einbox.store'
import { debounce } from 'lodash'

export default {
  components: {
    Communication,
    InboxChannelToggle
  },

  mixins: [
    EinboxMixin
  ],

  data () {
    return {
      activeContactId: null,
      THREADED
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
    ])
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

      if (isNearBottom && !this.isLoadingMoreItems && this.hasMoreItems) {
        this.loadMoreItems(this.activeInbox)
      }
    },

    onItemClick (contact) {
      // avoid redundant navigation
      if (this.activeContactId === contact.id) {
        return
      }

      this.activeContactId = contact.id

      this.$router.push(`/einbox/${this.activeInbox}/contacts/${contact.id}/communications`)
    }
  },

  watch: {
    '$route.params.id': {
      immediate: true,
      handler (newV) {
        this.activeContactId = newV ? parseInt(newV) : null
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.einbox-tab {
  height: 100%;
  background-color: white;
}

.items-list {
  flex: 1;
  overflow-y: auto;
}
</style>
