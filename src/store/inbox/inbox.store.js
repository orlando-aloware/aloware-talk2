export default function () {
  return {
    // Contact selection
    selectedContact: {},

    // Live contacts in active calls
    liveContacts: [],

    // Contact and communication lists
    contacts: [],
    communications: [],

    // Filter-related state
    activeChannel: null,
    appliedFilter: null,
    channelClonedFilter: {},
    channelChangedFilterFields: [],

    // Task counts
    taskCounts: {
      new: 0,
      open: 0,
      pending: 0,
      closed: 0
    },
    inboxTaskCounts: {
      new: 0,
      open: 0,
      pending: 0,
      closed: 0
    },

    // Loading states
    isLoadingOpenTaskCount: false,
    isLoadingPendingTaskCount: false,

    // Filter preferences
    inboxShowUnreads: false
  }
}
