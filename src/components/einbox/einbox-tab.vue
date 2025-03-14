<template>
  <div class="einbox-tab">
    <div class="einbox-tab__header border-bottom">
      <collapse-button class="einbox-tab__header__collapse-button"
                       :target="collapseTarget"
                       v-model="collapsed"
                       v-if="collapseTarget && !isMobile"/>

      <template v-if="!isSearchActive">
        <label class="einbox-tab__header__label ellipse"
              v-if="activeInbox.name">
          {{ activeInbox.name }}
        </label>
        <q-space></q-space>

        <span class="cursor-pointer"
              :id="`einbox-tab-open-comms-page-icon-${_uid}`"
              @click="$router.push(DEFAULT_COMMUNICATIONS_ROUTE_PATH)">
          <watch-icon />
          <b-tooltip custom-class="talk-table__tooltip"
                     :target="`einbox-tab-open-comms-page-icon-${_uid}`">
            Open Communications Page
          </b-tooltip>
        </span>

        <q-btn flat
               round
               color="primary"
               icon="search"
               size="sm"
               data-testid="einbox-tab-search-button"
               :id="`einbox-tab-search-icon-${_uid}`"
               @click="onEnterSearch">
          <b-tooltip custom-class="talk-table__tooltip"
                     :target="`einbox-tab-search-icon-${_uid}`">
            Click to search
          </b-tooltip>
        </q-btn>
      </template>

      <template v-else>
        <search-input ref="search"
                      placeholder="Type ENTER to search comms..."
                      class="einbox-tab__header__search"
                      :id="`einbox-tab-search-${_uid}`"
                      @search="search = $event"
                      @blur="onLeaveSearch"
                      @focus="showSearchTooltip = true"/>
        <b-tooltip custom-class="talk-table__tooltip"
                   placement="top"
                   :boundary="`einbox-tab-search-${_uid}`"
                   :target="`einbox-tab-search-${_uid}`"
                   :show="showSearchTooltip">
          Search communications by contact's name or phone number
        </b-tooltip>
      </template>
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
             v-for="item in itemsData"
             @click="onItemClick(item)">
          <communication :contact-id="item.contact_id"
                         :contact-name="item.contact.name"
                         :contact-phone-number="item.contact.phone_number"
                         :campaign-id="item.campaign_id"
                         :disposition-status="item.disposition_status2"
                         :type="item.type"
                         :direction="item.direction"
                         :callback-status="item.callback_status"
                         :body="item.body | truncate(20)"
                         :current-status="item.current_status2"
                         :date="item.created_at"
                         :total-unreads="viewMode === THREADED ? parseInt(item.unread_comms || 0) : 0"
                         :is-active="activeId === (viewMode === THREADED ? item.contact_id : item.id)"
                         :repeats="viewMode === UNTHREADED ? item.repeats : null"
                         :is-live-call="isLiveCall(item)" />
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
import SearchInput from 'src/components/search-input.vue'
import WatchIcon from 'src/components/icons/watch-icon.vue'
import { EinboxMixin } from 'src/plugins/mixins'
import { isLiveCall } from 'src/plugins/helpers/functions'
import { THREADED, UNTHREADED } from 'src/store/einbox/einbox.store'
import { DEFAULT_COMMUNICATIONS_ROUTE_PATH } from 'src/router/routes'
import { mapState } from 'vuex'
import { debounce } from 'lodash'

export default {
  components: {
    Communication,
    EinboxChannelToggle,
    CollapseButton,
    SearchInput,
    WatchIcon
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
      UNTHREADED,
      DEFAULT_COMMUNICATIONS_ROUTE_PATH,
      isSearchActive: false,
      itemsData: [],
      search: '',
      showSearchTooltip: false
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

    ...mapState(['isMobile']),

    filteredItems () {
      return this.items.filter(item => !item.hidden)
    }
  },

  created () {
    // Create debounced version of the scroll handler
    this.debouncedScroll = debounce(this.handleScroll, 300)

    // live communications events
    this.$VueEvent.listen('new_communication', this.newCommunicationListener)
    this.$VueEvent.listen('update_communication', this.updatedCommunicationListener)
  },

  beforeDestroy () {
    // Clean up the debounced function
    if (this.debouncedScroll) {
      this.debouncedScroll.cancel()
    }

    this.$VueEvent.stop('new_communication', this.newCommunicationListener)
    this.$VueEvent.stop('update_communication', this.updatedCommunicationListener)
  },

  methods: {
    isLiveCall,

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
    },

    async onEnterSearch () {
      this.isSearchActive = true

      await this.$nextTick()

      // auto focus inside inner search input
      this.$refs.search.$el.querySelector('input').focus()
    },

    onLeaveSearch () {
      if (this.search === '') {
        this.isSearchActive = false
      }
    },

    handleUnthreadedCommunication (communication, isNew = false) {
      if (isNew) {
        const found = this.itemsData.find(c => c.id === communication.id)
        if (!found) {
          this.itemsData.unshift(communication)
        }
      } else {
        const index = this.itemsData.findIndex(c => c.id === communication.id)
        if (index > -1) {
          this.itemsData.splice(index, 1, communication)
        }
      }
    },

    handleThreadedCommunication (communication, isNew = false) {
      const index = this.itemsData.findIndex(c => c.contact_id === communication.contact_id)

      if (isNew && index === -1) {
        this.itemsData.unshift(communication)
        return
      }

      if (index > -1) {
        this.itemsData.splice(index, 1, communication)
        this.sortItemsByDate()
      }
    },

    sortItemsByDate () {
      this.itemsData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    },

    processCommunication (communication, isNew = false) {
      if (communication.ring_group_id !== this.activeInboxId) {
        return
      }

      if (this.viewMode === UNTHREADED) {
        this.handleUnthreadedCommunication(communication, isNew)
      } else {
        this.handleThreadedCommunication(communication, isNew)
      }
    },

    newCommunicationListener (communication) {
      this.processCommunication(communication, true)
    },

    updatedCommunicationListener (communication) {
      this.processCommunication(communication, false)

      this.showSearchTooltip = false
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
    },

    '$route.name' (route) {
      // reset activeId in mobile when this page is opened
      if (this.isMobile && route === 'EInboxDetail') {
        this.activeId = null
      }
    },

    viewMode () {
      this.isSearchActive = false
      this.search = ''
    },

    search (search) {
      if (search === '') {
        this.isSearchActive = false
      }

      this.fetchItems(this.activeInboxId, search || null)
    },

    items () {
      this.itemsData = this.items.filter(item => !item.hidden)
    }
  }
}
</script>

<style lang="scss">
.einbox-tab {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: white;
  border-radius: inherit;

  &__header {
    display: flex;
    align-items: center;
    padding: 6px 15px;
    width: 100%;
    height: 45px;

    &__label {
      margin: 0px;
      font-weight: 500;
      font-size: 16px;
      flex-grow: 1;
    }

    &__search {
      width: 100%;

      label {
        border: none;
      }
    }
  }

  @media(min-width: 785px) {
    &__header {
      &__label {
        margin-left: 10px;
      }

      &__search {
        .q-field__prepend {
          padding-left: 5px !important;
        }
      }
    }
  }
}

.items-list {
  flex: 1;
  overflow-y: auto;
  width: 100%;
}
</style>
