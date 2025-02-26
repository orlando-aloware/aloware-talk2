import { THREADED } from './einbox.store'

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
  SET_IS_LOADING_INBOXES (state, loading) {
    state.isLoadingInboxes = loading
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
      items[index].repeats = repeateds.length
      hidden.push(...repeateds)
    }

    // mark repeated comms to dont appear
    if (hidden.includes(item.id)) {
      items[index].hidden = true
    }
  })

  return items
}

/**
 * Find repeated comms of a contact
 *
 * @param {array} items
 * @param {number} startIndex
 * @returns array
 */
function findRepeateds (items, startIndex) {
  const repeateds = []
  const contactId = items[startIndex].contact_id

  for (let i = startIndex + 1; i < items.length; i++) {
    if (items[i].contact_id !== contactId) {
      break
    }

    repeateds.push(items[i].id)
  }

  return repeateds
}
