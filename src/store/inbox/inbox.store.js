export default function () {
  return {
    selectedContactId: null,
    selectedCommunication: null,
    isGettingTasksList: false,
    isChannelFilterOpen: false,
    activeChannel: {
      label: 'Inbox',
      value: 'inbox',
      icon: 'inbox',
      disabled: false
    },
    items: [
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
        disabled: true
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
        label: 'Recordings',
        value: 'recordings',
        icon: 'record',
        disabled: false,
        type: 'call',
        answerStatus: 'recorded'
      }
    ],
    communications: [],
    contacts: [],
    selectedContact: {},
    taskCounts: {
      new: 0,
      open: 0,
      pending: 0,
      closed: 0
    }
  }
}
