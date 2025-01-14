import { DEFAULT_COMMUNICATIONS_CHANNEL } from 'src/router/routes'

const DEFAULT_CHANNEL = {
  label: 'Communications Logs',
  value: DEFAULT_COMMUNICATIONS_CHANNEL,
  icon: 'all-communications',
  disabled: false,
  default: true
}

export default function () {
  return {
    selectedContactId: null,
    selectedCommunication: null,
    isGettingTasksList: false,
    isFetchingContacts: false,
    isChannelFilterOpen: false,
    isSearcherOpen: false,
    activeChannel: DEFAULT_CHANNEL,
    navListItems: [
      DEFAULT_CHANNEL,
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
      }
      /* {
        label: 'Messages',
        value: 'messages',
        icon: 'message',
        disabled: false,
        type: 'sms',
        answerStatus: 'all'
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
      }
       {
        label: 'Mentions',
        value: 'mentions',
        icon: 'mention',
        disabled: false
      },

      {
        label: 'My Personal Line',
        value: 'my-personal-line',
        icon: 'person',
        disabled: false,
        type: 'all',
        answerStatus: 'all'
      } */
    ],
    communications: [],
    communicationsCount: 0,
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
    isFilterDialogShowFilters: false,
    isFilterDialogForView: false,
    selectedFilter: null,
    appliedFilter: null,
    isLoadingOpenTaskCount: false,
    isLoadingPendingTaskCount: false,
    isLoadingCommunications: false,
    isLoadingCommunicationsCount: false,
    inboxShowMyContacts: false,
    inboxShowUnreads: false,
    isInboxFiltersLoaded: true,
    pinnedViews: [],
    personalFilters: [],
    companyFilters: [],
    isDeletingFilter: false,
    isUpdatingFilter: false,
    isEditingView: false,
    showViewsList: false,
    isInboxRefreshBtnLoading: false,
    inboxFilters: {}
  }
}
