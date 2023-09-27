export const DEFAULT_STATE = {
  selectedContactId: null,
  selectedCommunication: null,
  isGettingTasksList: false,
  isFetchingContacts: false,
  isChannelFilterOpen: false,
  isSearcherOpen: false,
  activeChannel: {
    label: 'Inbox',
    value: 'inbox',
    icon: 'inbox',
    disabled: false
  },
  navListItems: [
    {
      label: 'Inbox',
      value: 'inbox',
      icon: 'inbox',
      disabled: false
    },
    {
      label: 'Channels',
      group: true,
      value: '',
      class: 'nav-list-group-title',
      icon: '',
      disabled: false
    },
    {
      label: 'Calls',
      value: 'calls',
      icon: 'call',
      disabled: false,
      type: 'call',
      answerStatus: 'all'
    },
    {
      label: 'Messages',
      value: 'messages',
      icon: 'message',
      disabled: false,
      type: 'sms',
      answerStatus: 'all'
    },
    {
      label: 'Mentions',
      value: 'mentions',
      icon: 'mention',
      disabled: false
    },
    {
      label: 'Voicemails',
      value: 'voicemails',
      icon: 'voicemail',
      disabled: false,
      type: 'call',
      answerStatus: 'voicemail'
    },
    {
      label: 'Call Recordings',
      value: 'recordings',
      icon: 'record',
      disabled: false,
      type: 'call',
      answerStatus: 'recorded'
    },
    {
      label: 'All Communications',
      value: 'all-communications',
      icon: 'all-communications',
      disabled: false,
      type: 'all',
      answerStatus: 'all'
    }
  ],
  communications: [],
  communicationsCurrentPage: 0,
  hasMoreCommunications: false,
  contacts: [],
  liveContacts: [], // contact task that are in live calls (incoming, in-progress or parked calls)
  contactsCurrentPage: 0,
  hasMoreContacts: false,
  selectedContact: {},
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
  channelClonedFilter: {},
  channelChangedFilterFields: [],
  isFilterModelFormShown: false,
  isFilterDialogShown: false,
  isFilterDialogForView: false,
  selectedFilter: null,
  appliedFilter: null,
  isLoadingOpenTaskCount: false,
  isLoadingPendingTaskCount: false,
  inboxShowMyContacts: true,
  isInboxFiltersLoaded: true,
  pinnedViews: [],
  inboxPersonalFilters: [],
  inboxCompanyFilters: [],
  isEditingView: false,
  showViewsList: false,
  isInboxRefreshBtnLoading: false
}
