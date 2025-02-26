<template>
  <div class="einbox-tab">
    <div class="einbox-tab__header border-bottom">
      <collapse-button class="einbox-tab__header__collapse-button"
                       :target="collapseTarget"
                       v-model="collapsed"
                       v-if="collapseTarget"/>

      <label class="einbox-tab__header__label ellipse"
             v-if="activeInbox.name">
        {{ activeInbox.name }}
      </label>
      <q-skeleton type=text
                  width="200px"
                  height="40px"
                  v-else/>
    </div>

    <einbox-channel-toggle />

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
          <communication :contact-id="item.contact_id"
                         :contact-name="item.contact.name"
                         :disposition-status="item.disposition_status2"
                         :type="item.type"
                         :direction="item.direction"
                         :callback-status="item.callback_status"
                         :body="item.body"
                         :current-status="item.current_status2"
                         :date="item.created_at"
                         :total-unreads="viewMode === THREADED ? parseInt(item.unread_comms || 0) : 0"
                         :is-active="activeId === (viewMode === THREADED ? item.contact_id : item.id)"
                         :repeats="viewMode === UNTHREADED ? item.repeats : null" />
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
import EinboxChannelToggle from './einbox-channel-toggle.vue'
import CollapseButton from 'src/components/collapse-button.vue'
import { EinboxMixin } from 'src/plugins/mixins'
import { mapState } from 'vuex'
import { THREADED, UNTHREADED } from 'src/store/einbox/einbox.store'
import { debounce } from 'lodash'

export default {
  components: {
    Communication,
    EinboxChannelToggle,
    CollapseButton
  },

  mixins: [
    EinboxMixin
  ],

  props: {
    collapseTarget: {
      type: HTMLElement,
      default: null
    }
  },

  data () {
    return {
      activeId: null,
      collapsed: false,
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
      'activeInboxId',
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
        this.loadMoreItems(this.activeInboxId)
      }
    },

    onItemClick (item) {
      this.activeId = this.viewMode === THREADED ? item.contact_id : item.id
      const route = `/einbox/${this.activeInboxId}/contacts/${item.contact_id}/communications`

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
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: white;
  border-radius: inherit;

  &__header {
    display: flex;
    align-items: center;
    padding: 15px;

    &__label {
      margin: 0 0 0 10px;
      font-weight: 500;
      font-size: 16px;
    }
  }
}

.items-list {
  flex: 1;
  overflow-y: auto;
  width: 100%;
}
</style>
