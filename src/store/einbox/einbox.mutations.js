export default {
  SET_ACTIVE_INBOX (state, inbox) {
    state.activeInbox = inbox
  },
  SET_NEW_INBOX (state, enabled) {
    state.newInboxEnabled = enabled
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
  SET_COMMUNICATION_TYPE (state, communicationType) {
    state.communicationType = communicationType
  },
  SET_COMMUNICATIONS (state, communications) {
    state.communications = parseCommunications(communications)
  },
  SET_IS_LOADING_COMMUNICATIONS (state, loading) {
    state.isLoadingCommunications = loading
  },
  SET_CURRENT_COMMUNICATIONS_PAGE (state, page) {
    state.currentCommunicationsPage = page
  },
  SET_HAS_MORE_COMMUNICATIONS (state, hasMore) {
    state.hasMoreCommunications = hasMore
  },
  RESET_COMMUNICATIONS_STATE (state) {
    state.communications = []
    state.currentCommunicationsPage = 0
    state.hasMoreCommunications = true
  },
  APPEND_COMMUNICATIONS (state, communications) {
    state.communications = [...state.communications, ...parseCommunications(communications)]
  },
  SET_IS_LOADING_MORE_COMMUNICATIONS (state, loading) {
    state.isLoadingMoreCommunications = loading
  }
}

/**
 * Parses the communications array to add the last_communication object
 *
 * @param {Array} communications
 * @returns {Array}
 */
const parseCommunications = (communications) => {
  return communications.map(comm => {
    // FIXME[Inbox]: manually setting last_communication object
    if (comm.last_communication_type) {
      comm.last_communication = {
        disposition_status2: comm.last_communication_disposition_status2,
        type: comm.last_communication_type,
        direction: comm.last_communication_direction,
        callback_status: comm.last_communication_callback_status,
        campaign_id: comm.last_communication_campaign_id,
        current_status2: comm.last_communication_current_status2,
        body: comm.last_communication_body
      }
    }
    return comm
  })
}
