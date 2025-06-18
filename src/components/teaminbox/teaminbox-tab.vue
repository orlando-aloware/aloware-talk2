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
import { TeamInboxMixin, visibilityMixin } from 'src/plugins/mixins'
import { getQueryString } from 'src/plugins/helpers/functions'
import * as CommunicationDirections from 'src/constants/communication-direction'
import * as CommunicationTypes from 'src/constants/communication-types'
import { THREADED, UNTHREADED } from 'src/store/teaminbox/teaminbox.store'
import { TEAMINBOXES_MENU_ITEMS_TITLE } from 'src/router/routes'
import { mapState, mapActions } from 'vuex'
import { debounce } from 'lodash'
import talk2Api from 'src/plugins/api/api'
import { ALL_INPROGRESS_STATUSES } from 'src/constants/communication-current-status'

export default {
  components: {
    CommunicationList,
    TeamInboxChannelToggle,
    TeamInboxTabHeader,
    TeamInboxFilterSort
  },

  mixins: [
    TeamInboxMixin,
    visibilityMixin
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
      ALL_INPROGRESS_STATUSES,
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
      'setIsLoadingMoreItems',
      'setContactsLastUsedLines'
    ]),

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

    async onItemClick (item) {
      let communicationUnreadCount = item.inbox_unread_count || 0
      const isThreaded = this.viewMode === THREADED
      this.activeId = isThreaded ? item.contact_id : item.id

      const communicationRouteId = isThreaded ? '' : `/${item.id}`
      const route = `/team-inboxes/${this.activeInboxId}/contacts/${item.contact_id}/communications${communicationRouteId}`

      if (!isThreaded) {
        // Fetch the unread count for the active communication (for unthreaded view)
        const unreadCount = await this.fetchInboxesUnreadCount([this.activeInboxId], [item.contact_id])
        const unreadCountData = unreadCount[0]
        const isInActiveInbox = unreadCountData && unreadCountData.ring_group_id === this.activeInboxId
        const unreadCountForContact = isInActiveInbox ? unreadCountData['unread_contact_' + item.contact_id] : 0
        item.inbox_unread_count = unreadCountForContact
        communicationUnreadCount = unreadCountForContact
      }

      this.$emit('contact-selected', {
        contactId: item.contact_id,
        unreadCount: communicationUnreadCount || 0
      })

      // avoid redundant navigation
      if (route === this.$route.path) {
        console.log('avoid redundant navigation')
        return
      }

      const queryString = getQueryString(this.$route.query)
      this.$router.push(`${route}${queryString}`)
    },

    onChannel () {
      if (!this.activeInboxId) {
        return
      }

      this.resetItems()
      this.fetchItems(this.activeInboxId, this.search || null, this.activeFilters, this.activeSort)
    },

    handleUnthreadedCommunication (communication) {
      const isAscendingOrder = this.activeSort?.order === 'asc'

      // Find if we have a group for this communication
      const groupKey = this.getGroupKey(communication)
      const existingGroup = this.itemsData.find(item => this.getGroupKey(item) === groupKey)

      // Special handling for calls
      if (communication.type === CommunicationTypes.CALL) {
        // If this is a live call, it should be shown separately
        if (this.communicationInProgress(communication)) {
          // Remove any existing non-live call from the same group
          const existingIndex = this.itemsData.findIndex(item =>
            this.getGroupKey(item) === groupKey && !this.communicationInProgress(item)
          )
          if (existingIndex > -1) {
            this.itemsData.splice(existingIndex, 1)
          }

          // Add the live call at the beginning
          this.itemsData.unshift(communication)
          this.sortItems()
          return
        }

        // If this is a non-live call, check if we have a live call from the same group
        const liveCallIndex = this.itemsData.findIndex(item =>
          this.getGroupKey(item) === groupKey && this.communicationInProgress(item)
        )

        if (liveCallIndex > -1) {
          // If we have a live call, update it with the completed call info
          const liveCall = this.itemsData[liveCallIndex]
          communication.repeats = (liveCall.repeats || 0) + 1
          communication.unread_repeats = (liveCall.unread_repeats || 0) + (!communication.is_read ? 1 : 0)
          this.itemsData.splice(liveCallIndex, 1, communication)
          this.sortItems()
          return
        }
      }

      this.updateUnthreadedCommunicationUnreadCount(communication)

      if (!existingGroup) {
        // New group - add at appropriate position based on sort order and pagination
        if (isAscendingOrder) {
          // For ascending order (Oldest first), only add to end if we're on the last page
          if (this.hasMoreItems) {
            // If there are more items to load, don't add the new communication
            return
          }

          // Add to end for ascending order
          this.itemsData.push(communication)
        } else {
          // Add to beginning for descending order
          this.itemsData.unshift(communication)
        }

        this.sortItems()
        return
      }

      // Update existing group
      const index = this.itemsData.findIndex(item => this.getGroupKey(item) === groupKey)

      if (index > -1) {
        // Handle unread count updates
        if (this.itemsData[index]?.is_read !== communication.is_read) {
          if (this.itemsData[index]?.repeats > 0) {
            communication.repeats = this.itemsData[index]?.repeats
            communication.unread_repeats = this.itemsData[index].unread_repeats + (communication.is_read ? -1 : 1)
          }
        }

        // Update the group with new communication
        this.itemsData.splice(index, 1, communication)
        this.sortItems()
      }
    },

    updateUnthreadedCommunicationUnreadCount (communication) {
      // Update unread count for all communications from the same contact
      if (!communication.is_read) {
        this.itemsData.forEach(item => {
          if (item.contact_id === communication.contact_id && item.id !== communication.id) {
            item.inbox_unread_count = (item.inbox_unread_count || 0) + 1
          }
        })
      }

      const selectedItem = this.itemsData.find(item => item.id === this.activeId)
      if (selectedItem?.contact_id === communication.contact_id) {
        // Emit contact-selected event to update the Mark all as Read component
        this.$emit('contact-selected', {
          contactId: communication.contact_id,
          unreadCount: selectedItem.inbox_unread_count || 0
        })
      }
    },

    getGroupKey (communication) {
      if (this.viewMode === THREADED) {
        // For threaded mode, group by contact ID or communication ID if no contact ID
        const groupId = communication.contact_id || communication.id
        return `${groupId}`
      }

      // For calls, group by contact, direction, and a sequence number
      if (communication.type === CommunicationTypes.CALL) {
        // Include the communication ID in the key to ensure uniqueness
        // This prevents accidental merging of calls that shouldn't be grouped
        return `${communication.contact_id}-${communication.direction}-${communication.id}`
      }

      // For texts, don't group - each is unique
      return `${communication.id}`
    },

    async getUnreadCount (ringGroupId, contactId) {
      const response = await talk2Api.V2.inbox.inboxes.unreadCount([ringGroupId], [contactId])
      return response.data.find(item => item.ring_group_id === ringGroupId && item.contact_id === contactId)?.unread_count || 0
    },

    async handleThreadedCommunication (communication, isNew = false) {
      const isAscendingOrder = this.activeSort && this.activeSort.order === 'asc'
      const index = this.itemsData.findIndex(c => c.contact_id === communication.contact_id)

      // Check filters and sorting settings
      if (!this.checkCommunication(communication, isAscendingOrder)) {
        if (index !== -1) {
          this.itemsData.splice(index, 1)
        }

        return
      }
      // New communication (not in the list)
      if (index === -1) {
        // For new communications, add them at appropriate position based on sort order
        if (isAscendingOrder && !this.communicationInProgress(communication)) {
          // Add to end for ascending order
          this.itemsData.push(communication)
        } else {
          // Add to beginning for descending order or live calls
          this.itemsData.unshift(communication)
        }

        this.sortItems()

        return
      }

      // Update the communication in the list, by removing it first, then adding it back in the same position
      this.itemsData.splice(index, 1)
      this.itemsData.splice(index, 0, communication)

      if (isNew) {
        // Remove the communication from the list
        this.itemsData.splice(index, 1)

        if (isAscendingOrder) {
          this.itemsData.push(communication)
        } else {
          this.itemsData.unshift(communication)
        }
      }

      this.sortItems()
    },

    sortItems () {
      const isAscendingOrder = this.activeSort?.order === 'asc'

      // First, group calls by their position in the list
      const groupedItems = {}

      this.itemsData.forEach((item, index) => {
        const key = this.getGroupKey(item)
        groupedItems[key] = item
      })

      // Convert grouped items back to array
      const sortedItems = Object.values(groupedItems)

      // Sort the items
      sortedItems.sort((a, b) => {
        // Always prioritize live calls at the top regardless of sort order
        if (this.communicationInProgress(a) && !this.communicationInProgress(b)) {
          return -1
        }

        if (!this.communicationInProgress(a) && this.communicationInProgress(b)) {
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

      // Update the itemsData with the sorted and grouped items
      this.itemsData = sortedItems
    },

    async processCommunicationInActiveInbox (communication, isNew = false) {
      // fetch unread count for the active inbox (from the backend)
      const unreadCount = await this.fetchInboxesUnreadCount([this.activeInboxId], [communication.contact_id])
      const unreadCountData = unreadCount[0]
      const isInActiveInbox = unreadCountData && unreadCountData.ring_group_id === this.activeInboxId
      const unreadCountForContact = isInActiveInbox ? unreadCountData['unread_contact_' + communication.contact_id] : 0
      communication.inbox_unread_count = unreadCountForContact || 0

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

    async processCommunicationInOtherInbox (communication, isNew = false) {
      const index = this.inboxes.findIndex(inbox => inbox.id === communication.ring_group_id)

      if (index === -1) {
        return
      }

      await this.fetchInboxesUnreadCount([this.inboxes[index].id])
    },

    async processCommunication (communication, isNew = false) {
      const dateRegex = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/
      const dateMatch = communication.created_at.match(dateRegex)

      if (dateMatch) {
        // Convert the date to a proper UTC date
        communication.created_at = dateMatch[1] + '-' + dateMatch[2] + '-' + dateMatch[3] + 'T' + dateMatch[4] + ':' + dateMatch[5] + ':' + dateMatch[6] + '.000Z'
      } else if (!dateMatch && isNew) {
        // Use the current date and time if the date is not properly formatted (fallback)
        communication.created_at = new Date().toISOString()
      }

      // If the communication is in the active inbox, process it
      if (communication.ring_group_id === this.activeInboxId) {
        await this.processCommunicationInActiveInbox(communication, isNew)
        return
      }

      // If the communication is not in the active inbox, process it
      await this.processCommunicationInOtherInbox(communication, isNew)
    },

    async newCommunicationListener (communication) {
      await this.processCommunication(communication, true)
    },

    async updatedCommunicationListener (communication) {
      this.updateContactLastUsedLine(communication)
      await this.processCommunication(communication)
    },

    updateContactLastUsedLine (communication) {
      const { contact_id: contactId, ring_group_id: ringGroupId, campaign_id: campaignId } = communication
      const isCommunicationInProgress = this.communicationInProgress(communication)

      if (!contactId || !ringGroupId || !campaignId || !isCommunicationInProgress) {
        return
      }

      // Update the last used line for the contact in the store
      this.setContactsLastUsedLines({
        inboxId: ringGroupId,
        data: [{
          contact_id: contactId,
          last_line_used: campaignId
        }]
      })
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
      this.fetchItems(this.activeInboxId, this.search || null, filters, this.activeSort)
    },

    onSortChange (sort) {
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
      if (data.id === this.activeId) {
        await this.markContactCommunicationsAllAsReadActiveContact(data)
        return
      }

      // If not the active contact, re-count all the unread counts of all the inboxes
      await this.fetchInboxesUnreadCount(this.inboxes.map(inbox => inbox.id))

      // Now check if the contact is in the active inbox, to update its unread count
      const item = this.itemsData.find(item => item.contact_id === data.id)
      if (!item) {
        return
      }

      const unreads = await this.fetchInboxesUnreadCount([this.activeInboxId], [data.id])

      if (!unreads.length) {
        item.inbox_unread_count = 0
      } else {
        item.inbox_unread_count = unreads[0].ring_group_id === this.activeInboxId && unreads[0]['unread_contact_' + data.id] ? unreads[0]['unread_contact_' + data.id] : 0
      }

      // Update all communications from this contact in the unthreaded view
      if (this.viewMode === UNTHREADED) {
        // If this is the currently selected contact, emit the contact-selected event
        if (this.itemsData.find(comm => comm.id === this.activeId)?.contact_id === data.id) {
          this.$emit('contact-selected', {
            contactId: data.id,
            unreadCount: item.inbox_unread_count
          })
        }
      } else {
        // Update communication to reflect updated value
        this.itemsData.splice(this.itemsData.indexOf(item), 1, item)
      }
    },

    async markContactCommunicationsAllAsReadActiveContact (data) {
      const itemIndex = this.itemsData.findIndex(item => item.contact_id === this.activeId)
      const item = itemIndex !== -1 ? this.itemsData[itemIndex] : null

      if (!item) {
        return
      }

      // update the unread count for the contact
      const unreadCount = await this.getUnreadCount(this.activeInboxId, this.activeId)
      item.inbox_unread_count = unreadCount

      // fetch unread count for the active inbox (from the backend)
      await this.fetchInboxesUnreadCount([this.activeInboxId])

      // Update all communications from this contact in the unthreaded view
      if (this.viewMode === UNTHREADED) {
        this.itemsData.forEach(comm => {
          if (comm.contact_id === this.activeId) {
            comm.inbox_unread_count = unreadCount
            comm.is_read = true
            if (comm.repeats > 0) {
              comm.unread_repeats = 0
            }
          }
        })

        // Emit contact-selected event to update the Mark all as Read component
        this.$emit('contact-selected', {
          contactId: this.activeId,
          unreadCount: unreadCount
        })
      } else {
        // For threaded view, simulate a click on the contact to update the unread count
        this.onItemClick(item)

        if (!this.checkCommunication(item)) {
          // Remove communication if it doesn't match filters and sorting settings
          this.itemsData.splice(itemIndex, 1)
        } else {
          // Update communication to reflect updated value
          this.itemsData.splice(itemIndex, 1, item)
        }
      }
    },

    checkCommunication (communication, sortAsc = false) {
      return (this.checkCommunicationMatchesSearch(this.search, communication) &&
          this.checkCommunicationMatchesInboxFilters(this.activeFilters, communication, false) &&
          !(sortAsc && this.hasMoreItems)) ||
          this.communicationInProgress(communication)
    },

    communicationInProgress (communication) {
      if (communication.type !== CommunicationTypes.CALL) {
        return false
      }

      return this.ALL_INPROGRESS_STATUSES.includes(communication.current_status2)
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

    '$route.params.communicationId' (communicationId) {
      if (!communicationId) {
        return
      }

      if (this.viewMode === THREADED) {
        return
      }

      const communication = this.itemsData.find(item => item.id === parseInt(communicationId))

      if (!communication) {
        return
      }

      this.onItemClick(communication)
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
