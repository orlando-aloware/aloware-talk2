<template>
  <div class="teaminbox-tab">
    <TeamInboxTabHeader :collapse-target="collapseTarget"
                       :search="search"
                       @search="search = $event" />

    <TeamInboxChannelToggle @channel="onChannel"/>

    <TeamInboxFilterSort @filter-change="onFilterChange" @sort-change="onSortChange" />

    <!-- Items List -->
    <div class="items-list blue-scroll"
         @scroll="onScroll">
      <communication-list
        :items="itemsData"
        :is-loading-items="isLoadingItems"
        :is-loading-more-items="isLoadingMoreItems"
        :load-error="loadError"
        :active-id="activeId"
        :view-mode="viewMode"
        :show-refresh-communications-button="showRefreshCommunicationsButton"
        @item-click="onItemClick"
        @refresh="onRefreshCommunications"
      />
    </div>
  </div>
</template>

<script>
import CommunicationList from 'src/components/teaminbox/communication-items/communication-list.vue'
import TeamInboxChannelToggle from './teaminbox-channel-toggle.vue'
import TeamInboxTabHeader from './teaminbox-tab-header.vue'
import TeamInboxFilterSort from './teaminbox-filter-sort.vue'
import { TeamInboxMixin } from 'src/plugins/mixins'
import { isLiveCall } from 'src/plugins/helpers/functions'
import * as CommunicationDirections from 'src/constants/communication-direction'
import * as CommunicationTypes from 'src/constants/communication-types'
import { THREADED, UNTHREADED } from 'src/store/teaminbox/teaminbox.store'
import { TEAMINBOXES_MENU_ITEMS_TITLE } from 'src/router/routes'
import { mapState, mapActions } from 'vuex'
import { debounce } from 'lodash'
import talk2Api from 'src/plugins/api/api'

export default {
  components: {
    CommunicationList,
    TeamInboxChannelToggle,
    TeamInboxTabHeader,
    TeamInboxFilterSort
  },

  mixins: [
    TeamInboxMixin
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
      search: '',
      THREADED,
      UNTHREADED,
      TEAMINBOXES_MENU_ITEMS_TITLE,
      itemsData: [],
      CommunicationDirections,
      CommunicationTypes,
      filterOption: 'All',
      sortOption: 'Newest',
      loadError: false
    }
  },

  computed: {
    ...mapState('TeamInbox', [
      'items',
      'isLoadingItems',
      'isLoadingMoreItems',
      'hasMoreItems',
      'activeInboxId',
      'activeInbox',
      'viewMode',
      'showRefreshCommunicationsButton',
      'activeFilters',
      'activeSort',
      'currentSearch',
      'isInitialLoad'
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
    this.$VueEvent.listen('contact_updated', this.updatedContactListener)
    this.$VueEvent.listen('mark_contact_communications_all_as_read', this.markContactCommunicationsAllAsReadListener)
  },

  beforeDestroy () {
    // Clean up the debounced function
    if (this.debouncedScroll) {
      this.debouncedScroll.cancel()
    }

    this.$VueEvent.stop('new_communication', this.newCommunicationListener)
    this.$VueEvent.stop('update_communication', this.updatedCommunicationListener)
    this.$VueEvent.stop('contact_updated', this.updatedContactListener)
    this.$VueEvent.stop('mark_contact_communications_all_as_read', this.markContactCommunicationsAllAsReadListener)
  },

  methods: {
    ...mapActions('TeamInbox', [
      'setActiveFilters',
      'setActiveSort',
      'setCurrentSearch',
      'setIsInitialLoad',
      'setIsLoadingMoreItems'
    ]),

    isLiveCall,

    getUnreadsProperties (communication) {
      if (this.viewMode === UNTHREADED) {
        return {
          unread_count: communication.repeats > 0 ? communication.unread_repeats : (!communication.is_read ? 1 : 0)
        }
      }

      return {
        unread_count: communication.inbox_unread_count
      }
    },

    onScroll ({ target }) {
      this.debouncedScroll(target)
    },

    handleScroll (target) {
      const bottomThreshold = 50
      const isNearBottom = target.scrollHeight - (target.scrollTop + target.clientHeight) <= bottomThreshold

      if (isNearBottom && !this.isLoadingMoreItems && !this.isLoadingItems && this.hasMoreItems) {
        this.loadMoreItems(this.activeInboxId)
      }
    },

    onItemClick (item) {
      this.activeId = this.viewMode === THREADED ? item.contact_id : item.id
      const route = `/team-inboxes/${this.activeInboxId}/contacts/${item.contact_id}/communications`

      // Emit the unread count for threaded communications
      if (this.viewMode === THREADED) {
        // Get unread count for this contact
        const unreadCount = item.inbox_unread_count || 0

        // Emit event with contact ID and unread count
        this.$emit('contact-selected', {
          contactId: item.contact_id,
          unreadCount: unreadCount
        })
      } else {
        // For unthreaded, we'll just emit 0 for now
        this.$emit('contact-selected', {
          contactId: item.contact_id,
          unreadCount: 0
        })
      }

      // avoid redundant navigation
      if (route === this.$route.path) {
        return
      }

      this.$router.push(route)
    },

    onChannel () {
      if (!this.activeInboxId) {
        return
      }

      this.resetItems()
      this.fetchItems(this.activeInboxId, this.search || null, this.activeFilters, this.activeSort)
    },

    handleUnthreadedCommunication (communication) {
      const isAscendingOrder = this.activeSort && this.activeSort.order === 'asc'

      const found = this.itemsData.find(c => c.id === communication.id)
      if (!found) {
        // For new communications, add them at appropriate position based on sort order
        if (isAscendingOrder && !isLiveCall(communication)) {
          this.itemsData.push(communication) // Add to end for ascending order
        } else {
          this.itemsData.unshift(communication) // Add to beginning for descending order or live calls
        }
      } else {
        const index = this.itemsData.findIndex(c => c.id === communication.id)
        if (index > -1) {
          // If the is_read property is changed, adjust the unread counts
          if (this.itemsData[index]?.is_read !== communication.is_read) {
            // let unreadCount = this.itemsData[index]?.inbox_unread_count || 0
            if (this.itemsData[index]?.repeats > 0) {
              communication.repeats = this.itemsData[index]?.repeats
              communication.unread_repeats = this.itemsData[index].unread_repeats + (communication.is_read ? -1 : 1)
            }
          }

          this.itemsData.splice(index, 1, communication)
        }
      }
    },

    async getUnreadCount (ringGroupId, contactId) {
      const response = await talk2Api.V2.inbox.inboxes.unreadCount([ringGroupId], [contactId])
      return response.data.find(item => item.ring_group_id === ringGroupId && item.contact_id === contactId)?.unread_count || 0
    },

    async handleThreadedCommunication (communication, isNew = false) {
      const isAscendingOrder = this.activeSort && this.activeSort.order === 'asc'
      const index = this.itemsData.findIndex(c => c.contact_id === communication.contact_id)

      // New communication (not in the list)
      if (index === -1) {
        // For new communications, add them at appropriate position based on sort order
        if (isAscendingOrder && !isLiveCall(communication)) {
          this.itemsData.push(communication) // Add to end for ascending order
        } else {
          this.itemsData.unshift(communication) // Add to beginning for descending order or live calls
        }

        return
      }

      // Existing communication logic below (in the list)
      // Ignore live calls in threaded mode
      if (isLiveCall(this.itemsData[index])) {
        return
      }

      this.itemsData.splice(index, 1, communication)
    },

    sortItems () {
      const isAscendingOrder = this.activeSort && this.activeSort.order === 'asc'

      this.itemsData.sort((a, b) => {
        // Always prioritize live calls at the top regardless of sort order
        if (isLiveCall(a) && !isLiveCall(b)) {
          return -1
        }

        if (!isLiveCall(a) && isLiveCall(b)) {
          return 1
        }

        // For non-live calls, respect the sort order
        const dateA = new Date(a.created_at)
        const dateB = new Date(b.created_at)

        if (isAscendingOrder) {
          // Oldest first (ascending)
          return dateA - dateB
        }

        // Newest first (descending, default)
        return dateB - dateA
      })
    },

    async processCommunication (communication, isNew = false) {
      if (!this.activeInboxId || communication.ring_group_id !== this.activeInboxId) {
        return
      }

      // fetch unread count for the active inbox (from the backend)
      const unreadCount = await this.fetchInboxesUnreadCount([this.activeInboxId], [communication.contact_id])
      communication.inbox_unread_count = unreadCount[0] && unreadCount[0].ring_group_id === this.activeInboxId && unreadCount[0]['unread_contact_' + communication.contact_id] ? unreadCount[0]['unread_contact_' + communication.contact_id] : 0

      if (this.viewMode === UNTHREADED) {
        await this.handleUnthreadedCommunication(communication)
      } else {
        await this.handleThreadedCommunication(communication, isNew)
      }

      if (!this.activeId) {
        return
      }

      // Emits the signal to update the unread count for the active inbox
      const index = this.itemsData.findIndex(item => item.contact_id === this.activeId)
      if (index >= 0) {
        this.onItemClick(this.itemsData[index])
      }
    },

    async newCommunicationListener (communication) {
      await this.processCommunication(communication, true)
    },

    async updatedCommunicationListener (communication) {
      await this.processCommunication(communication)
    },

    updatedContactListener (contact) {
      // search for this contact in the current communications
      // this is necessary for keeping the contact updated from other inboxes communications
      const index = this.itemsData.findIndex(communication => communication.contact_id === contact.id)

      if (index >= 0) {
        this.itemsData[index].contact = contact
      }
    },

    getMessageBody (item) {
      if (item.body && item.body.trim() !== '') {
        return this.$options.filters.truncate(item.body, 20)
      }

      if (item.attachments?.length > 0) {
        return `${item.direction === CommunicationDirections.INBOUND ? CommunicationDirections.INBOUND_STRING : CommunicationDirections.OUTBOUND_STRING} ${CommunicationTypes.MMS_TYPE}`
      }

      return ''
    },

    onRefreshCommunications () {
      this.loadError = false
      this.fetchItems(this.activeInboxId, this.search || null, this.activeFilters, this.activeSort)
    },

    onFilterChange (filters) {
      this.setActiveFilters(filters)
      this.fetchItems(this.activeInboxId, this.search || null, filters, this.activeSort)
    },

    onSortChange (sort) {
      this.setActiveSort(sort)
      this.fetchItems(this.activeInboxId, this.search || null, this.activeFilters, sort)
    },

    // Count distinct contact groups in the current data
    countDistinctGroups () {
      if (!this.itemsData.length) return 0

      // If in threaded mode, count the number of unique contact IDs
      if (this.viewMode === THREADED) {
        const uniqueContactIds = new Set()
        this.itemsData.forEach(item => {
          if (!item.hidden && item.contact_id) {
            uniqueContactIds.add(item.contact_id)
          }
        })
        return uniqueContactIds.size
      }

      // If in unthreaded mode, count communications that aren't marked as hidden
      // and those that are the first in a sequence (with repeats > 0)
      let count = 0
      for (let i = 0; i < this.itemsData.length; i++) {
        const item = this.itemsData[i]
        if (!item.hidden) {
          count++
        }
      }
      return count
    },

    // Check if we need to load more data based on group count threshold
    checkAndLoadMoreIfNeeded () {
      // Don't try to load more if:
      // 1. Already loading
      // 2. No more items available
      // 3. We're on the last page (next_page_url is null)
      // 4. Empty inbox (no items at all)
      if (
        this.isLoadingMoreItems ||
        !this.hasMoreItems ||
        this.itemsData.length === 0
      ) {
        // If we have an empty inbox or we're on the last page, reset the initial load flag
        if (this.itemsData.length === 0) {
          this.setIsInitialLoad(false)
        }
        return
      }

      const MIN_GROUP_THRESHOLD = 25
      const groupCount = this.countDistinctGroups()

      if (groupCount < MIN_GROUP_THRESHOLD) {
        // Load more items and continue checking after they're loaded
        this.loadMoreItemsAndCheckAgain(this.activeInboxId)
      } else {
        // We've reached the threshold, reset the initial load flag
        this.setIsInitialLoad(false)
      }
    },

    // Load more items and check again after they're loaded
    async loadMoreItemsAndCheckAgain (inboxId) {
      try {
        if (this.isLoadingMoreItems || !this.hasMoreItems) return

        this.setIsLoadingMoreItems(true)

        const nextPage = this.currentItemsPage + 1
        // Get current filter and sort state from Vuex
        const filters = this.activeFilters || {}
        const sort = this.activeSort || {}
        const search = this.currentSearch

        const response = await this.getItemsRequest(inboxId, nextPage, search, filters, sort)

        this.appendItems(response.data)
        this.setIsLoadingMoreItems(false)

        // Check if we received empty data or we're on the last page
        if (!response.data || !response.data.data || response.data.data.length === 0 || response.data.next_page_url === null) {
          console.log('Reached last page or empty response, stopping auto-load')
          this.setIsInitialLoad(false)
          return
        }

        // Wait a short time for the UI to update, then check if we need more
        setTimeout(() => {
          if (this.isInitialLoad) {
            this.checkAndLoadMoreIfNeeded()
          }
        }, 100)
      } catch (error) {
        console.error('Error loading more items:', error)
        this.setIsLoadingMoreItems(false)
        this.setIsInitialLoad(false) // Reset on error
        this.loadError = true // Set error state
      }
    },

    async fetchItems (inboxId, search = null, filters = {}, sort = {}) {
      try {
        this.loadError = false
        // Call the mixin method directly instead of dispatching a Vuex action
        await this.$options.mixins[0].methods.fetchItems.call(this, inboxId, search, filters, sort)
      } catch (error) {
        console.error('Error fetching items:', error)
        this.loadError = true
        this.$store.commit('TeamInbox/SET_IS_LOADING_ITEMS', false)
        this.setIsInitialLoad(false)
      }
    },

    async markContactCommunicationsAllAsReadListener (data) {
      // Check if the contact id matches the current active contact
      if (data.id !== this.activeId) {
        return
      }

      const item = this.itemsData.find(item => item.contact_id === this.activeId)

      if (!item) {
        return
      }

      // update the unread count for the contact
      const unreadCount = await this.getUnreadCount(this.activeInboxId, this.activeId)
      item.inbox_unread_count = unreadCount

      // fetch unread count for the active inbox (from the backend)
      await this.fetchInboxesUnreadCount([this.activeInboxId])

      // simulate a click on the contact to update the unread count
      this.onItemClick(item)
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

    '$route.params.inboxId' () {
      this.search = ''
    },

    '$route.name' (route) {
      // reset activeId in mobile when this page is opened
      if (this.isMobile && route === TEAMINBOXES_MENU_ITEMS_TITLE) {
        this.activeId = null
      }
    },

    search (search) {
      this.setCurrentSearch(search)
      this.fetchItems(this.activeInboxId, search || null, this.activeFilters, this.activeSort)
    },

    items: {
      handler (newItems) {
        this.itemsData = newItems.filter(item => !item.hidden)
        this.sortItems()

        // Only auto-load more if this is the initial page load
        if (this.isInitialLoad) {
          this.checkAndLoadMoreIfNeeded()

          if (!this.$route.params.id) {
            return
          }

          // If the contact on the route is on the list, fake a click to emit its selection
          const item = this.itemsData.find(item => item.contact_id === parseInt(this.$route.params.id))
          if (item) {
            this.onItemClick(item)
          }
        }
      }
    }
  }
}
</script>

<style lang="scss">
.teaminbox-tab {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: white;
  border-radius: inherit;
}

.items-list {
  flex: 1;
  overflow-y: auto;
  width: 100%;
}
</style>
