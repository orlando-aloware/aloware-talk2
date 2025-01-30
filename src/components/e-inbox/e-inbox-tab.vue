<template>
  <div class="e-inbox-tab d-flex flex-column w-100">
    <inbox-channel-toggle />

    <!-- Communications List -->
    <div
      class="communications-list"
      ref="communicationsList"
      @scroll="onScroll"
    >
      <!-- Initial loading state -->
      <div
        v-if="isLoadingCommunications"
        :class="[isLoadingCommunications ? 'py-5' : 'py-4', 'relative']"
      >
        <b-overlay
          :show="isLoadingCommunications"
          rounded="sm"
          variant="white"
          data-testid="communications-list-overlay"
        >
          <template #overlay>
            <div class="text-center">
              <q-spinner-bars
                color="primary"
                size="2em"
              />
            </div>
          </template>
        </b-overlay>
      </div>

      <!-- Communications list -->
      <template v-else-if="communications.length">
        <div
          v-for="comm in communications"
          :key="comm.id"
          class="communication-item q-px-md q-py-sm"
          @click="onCommunicationClick(comm)"
        >
          <call-item
            v-if="comm.type === CALLS_TYPE"
            :comm="comm"
          />
          <message-item
            v-else-if="comm.type === SMS_TYPE"
            :comm="comm"
          />
        </div>

        <!-- Load more indicator -->
        <div v-if="isLoadingMoreCommunications" class="text-center q-pa-sm">
          <q-spinner-dots color="primary" size="2em" />
        </div>
      </template>

      <!-- Empty state -->
      <div v-else class="text-center q-pa-md text-grey">
        No communications found
      </div>
    </div>
  </div>
</template>

<script>
import InboxChannelToggle from './inbox-channel-toggle.vue'
import CallItem from './communication-items/call-item.vue'
import MessageItem from './communication-items/message-item.vue'
import { mapState } from 'vuex'
import eInboxMixin from 'src/plugins/mixins/e-inbox.mixin'
import { CALLS_TYPE, SMS_TYPE } from 'src/store/e-inbox/e-inbox.store'
import { debounce } from 'lodash'

export default {
  name: 'EInboxTab',

  components: {
    InboxChannelToggle,
    CallItem,
    MessageItem
  },

  mixins: [eInboxMixin],

  data () {
    return {
      CALLS_TYPE,
      SMS_TYPE
    }
  },

  computed: {
    ...mapState('eInbox', [
      'communications',
      'isLoadingCommunications',
      'isLoadingMoreCommunications',
      'hasMoreCommunications',
      'activeInbox'
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
      const isNearBottom =
        target.scrollHeight - (target.scrollTop + target.clientHeight) <= bottomThreshold

      if (isNearBottom && !this.isLoadingMoreCommunications && this.hasMoreCommunications) {
        this.loadMoreCommunications(this.activeInbox)
      }
    },

    onCommunicationClick (communication) {
      this.$router.push({
        name: 'Inbox Contact',
        params: {
          channel: 'inbox',
          id: communication.contact_id,
          communicationId: communication.id
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.e-inbox-tab {
  height: 100%;
  background-color: white;
}

.communications-list {
  flex: 1;
  overflow-y: auto;

  .communication-item {
    border-bottom: 1px solid #eeeeee;
    transition: background-color 0.2s;

    &:hover {
      background-color: #f5f5f5;
      cursor: pointer;
    }
  }
}
</style>
