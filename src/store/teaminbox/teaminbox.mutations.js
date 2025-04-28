import { THREADED } from './teaminbox.store'
import { isLiveCall } from 'src/plugins/helpers/functions'

export default {
  SET_ACTIVE_INBOX_ID (state, inbox) {
    state.activeInboxId = inbox
  },
  SET_ACTIVE_INBOX (state, inbox) {
    state.activeInbox = inbox
  },
  SET_INBOXES (state, inboxesFirstPage) {
    state.inboxes = [ ...inboxesFirstPage ]
  },
  RESET_INBOXES (state) {
    state.inboxes = []
  },
  SET_IS_LOADING_INBOXES (state, loading) {
    state.isLoadingInboxes = loading
  },
  SET_INBOXES_UNREAD_COUNT (state, inboxesUnreadCount) {
    state.inboxesUnreadCount = [ ...inboxesUnreadCount ]
  },
  SET_IS_LOADING_INBOXES_UNREAD_COUNT (state, loading) {
    state.isLoadingInboxesUnreadCount = loading
  },
  SET_CURRENT_INBOXES_PAGE (state, page) {
    state.currentInboxesPage = page
  },
  SET_HAS_MORE_INBOXES (state, hasMore) {
    state.hasMoreInboxes = hasMore
  },
  APPEND_INBOXES (state, inboxes) {
    state.inboxes = [ ...state.inboxes, ...inboxes ]
  },
  SET_VIEW_MODE (state, viewMode) {
    state.viewMode = viewMode
  },
  SET_ITEMS (state, items) {
    state.items = state.viewMode === THREADED ? items : handleDuplicatedItems(items)
  },
  SET_IS_LOADING_ITEMS (state, loading) {
    state.isLoadingItems = loading
  },
  SET_CURRENT_ITEMS_PAGE (state, page) {
    state.currentItemsPage = page
  },
  SET_HAS_MORE_ITEMS (state, hasMore) {
    state.hasMoreItems = hasMore
  },
  RESET_ITEMS (state) {
    state.items = []
    state.currentItemsPage = 0
    state.hasMoreItems = true
  },
  APPEND_ITEMS (state, items) {
    const allItems = [...state.items, ...items]
    state.items = state.viewMode === THREADED ? allItems : handleDuplicatedItems(allItems)
  },
  SET_IS_LOADING_MORE_ITEMS (state, loading) {
    state.isLoadingMoreItems = loading
  },
  SET_ABORT_CONTROLLER (state, abortController) {
    state.abortController = abortController
  },
  SET_SHOW_REFRESH_INBOXES_BUTTON (state, show) {
    state.showRefreshInboxesButton = show
  },
  SET_SHOW_REFRESH_COMMUNICATIONS_BUTTON (state, show) {
    state.showRefreshCommunicationsButton = show
  },
  SET_ACTIVE_FILTERS (state, filters) {
    state.activeFilters = filters
  },
  SET_ACTIVE_SORT (state, sort) {
    state.activeSort = sort
  },
  SET_CURRENT_SEARCH (state, search) {
    state.currentSearch = search
  },
  SET_IS_INITIAL_LOAD (state, isInitial) {
    state.isInitialLoad = isInitial
  }
}

/**
 * Handle sequenced-duplicated items for the unthreaded view
 *
 * @param {array} items
 * @returns array
 */
function handleDuplicatedItems (items) {
  // first unset all props previous set
  items.forEach((item, index) => {
    delete items[index].repeats
    delete items[index].hidden
  })

  const hidden = []

  items.forEach((item, index) => {
    const repeateds = findRepeateds(items, index)

    // try to find repeated comms for this contact
    if (repeateds.length > 0) {
      const repeatedItems = [item, ...repeateds.map(id => items.find(i => i.id === id))]
      const liveCallItem = repeatedItems.find(i => isLiveCall(i))

      if (liveCallItem) {
        repeatedItems.forEach(repeatedItem => {
          const itemIndex = items.findIndex(i => i.id === repeatedItem.id)
          if (repeatedItem.id !== liveCallItem.id) {
            hidden.push(repeatedItem.id)
          } else {
            items[itemIndex].repeats = repeatedItems.length - 1
          }
        })
      } else {
        items[index].repeats = repeateds.length
        hidden.push(...repeateds)
      }
    }

    // mark repeated comms to dont appear
    if (hidden.includes(item.id)) {
      items[index].hidden = true
    }
  })

  return items
}

/**
 * Find repeated comms of a contact based on specific rules
 *
 * @param {array} items
 * @param {number} startIndex
 * @returns array
 */
function findRepeateds (items, startIndex) {
  const repeateds = []
  const currentItem = items[startIndex]
  const currentType = currentItem.type
  const currentDirection = currentItem.direction
  const currentTimestamp = new Date(currentItem.created_at).getTime()

  // Time threshold in milliseconds (60 minutes = 3,600,000 ms)
  const TIME_THRESHOLD = 60 * 60 * 1000

  for (let i = startIndex + 1; i < items.length; i++) {
    const nextItem = items[i]

    // Check if it's the same contact
    if (nextItem.contact_id !== currentItem.contact_id) {
      break
    }

    // Check if type matches
    if (nextItem.type !== currentType) {
      continue
    }

    // Check if direction matches
    if (nextItem.direction !== currentDirection) {
      continue
    }

    // Check if it's within the time threshold (60 minutes)
    const nextTimestamp = new Date(nextItem.created_at).getTime()
    const timeDiff = Math.abs(currentTimestamp - nextTimestamp)

    if (timeDiff <= TIME_THRESHOLD) {
      repeateds.push(nextItem.id)
    }
  }

  return repeateds
}
