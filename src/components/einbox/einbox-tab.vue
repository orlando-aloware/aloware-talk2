<template>
  <div class="einbox-tab d-flex flex-column w-100">
    <!-- <inbox-channel-toggle /> -->

    <!-- Communications List -->
    <div class="communications-list"
         ref="communicationsList"
         @scroll="onScroll">
      <!-- Initial loading state -->
      <div :class="[isLoadingCommunications ? 'py-5' : 'py-4', 'relative']"
           v-if="isLoadingCommunications">
        <b-overlay rounded="sm"
                   variant="white"
                   data-testid="communications-list-overlay"
                   :show="isLoadingCommunications">
          <template #overlay>
            <div class="text-center">
              <q-spinner-bars color="primary"
                              size="2em" />
            </div>
          </template>
        </b-overlay>
      </div>

      <!-- Communications list -->
      <template v-else-if="communications.length">
        <div :key="comm.id"
             v-for="comm in communications"
             @click="onCommunicationClick(comm)">
             <inbox-task-item :contact="comm"
                           :force-active="comm.id === activeContactId" />
        </div>

        <!-- Load more indicator -->
        <div class="text-center q-pa-sm"
             v-if="isLoadingMoreCommunications">
          <q-spinner-dots color="primary" size="2em" />
        </div>
      </template>

      <!-- Empty state -->
      <div class="text-center q-pa-md text-grey"
           v-else>
        No communications found
      </div>
    </div>
  </div>
</template>

<script>
import InboxTaskItem from 'src/components/inbox/inbox-tasks/item.vue'
import { mapState } from 'vuex'
import EinboxMixin from 'src/plugins/mixins/einbox.mixin'
import { debounce } from 'lodash'

export default {
  name: 'EInboxTab',

  components: {
    InboxTaskItem
  },

  mixins: [
    EinboxMixin
  ],

  data () {
    return {
      // CALLS_TYPE,
      // SMS_TYPE,
      activeContactId: null
    }
  },

  computed: {
    ...mapState('Einbox', [
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
      const isNearBottom = target.scrollHeight - (target.scrollTop + target.clientHeight) <= bottomThreshold

      if (isNearBottom && !this.isLoadingMoreCommunications && this.hasMoreCommunications) {
        this.loadMoreCommunications(this.activeInbox)
      }
    },

    onCommunicationClick (contact) {
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
