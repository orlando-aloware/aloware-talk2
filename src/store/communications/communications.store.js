import { ANY_COMMUNICATION_ANSWER_STATUS, STATUS_RECORDED, STATUS_VOICEMAIL } from 'src/constants/communication-status'
import { ANY_COMMUNICATION_TYPE, CALL_TYPE, SMS_TYPE } from 'src/constants/communication-types'
import { CALLS_CHANNEL, DEFAULT_COMMUNICATIONS_CHANNEL, MESSAGES_CHANNEL, RECORDINGS_CHANNEL, VOICEMAILS_CHANNEL } from 'src/router/routes'

const DEFAULT_CHANNEL = {
  label: 'Communications Logs',
  value: DEFAULT_COMMUNICATIONS_CHANNEL,
  icon: 'all-communications',
  type: ANY_COMMUNICATION_TYPE,
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
        value: CALLS_CHANNEL,
        icon: 'call',
        disabled: false,
        type: CALL_TYPE,
        answerStatus: ANY_COMMUNICATION_ANSWER_STATUS
      },
      {
        label: 'Voicemails',
        value: VOICEMAILS_CHANNEL,
        icon: 'voicemail',
        disabled: false,
        type: CALL_TYPE,
        answerStatus: STATUS_VOICEMAIL
      },
      {
        label: 'Call Recordings',
        value: RECORDINGS_CHANNEL,
        icon: 'record',
        disabled: false,
        type: CALL_TYPE,
        answerStatus: STATUS_RECORDED
      },
      {
        label: 'Messages',
        value: MESSAGES_CHANNEL,
        icon: 'message',
        disabled: false,
        type: SMS_TYPE,
        answerStatus: ANY_COMMUNICATION_ANSWER_STATUS
      }
      /*
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
