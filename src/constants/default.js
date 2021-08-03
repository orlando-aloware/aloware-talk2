export const DEFAULT_STATE = {
  filter: {},
  tags: [],
  campaigns: [],
  users: [],
  ringGroups: [],
  workflows: [],
  changelogs: [],
  dispositionStatuses: [],
  callDispositions: [],
  scripts: [],
  templates: [],
  broadcasts: [],
  filters: [],
  firstLogin: false,
  userStatus: false,
  oldAgentStatus: false,
  dialer: {
    token: null,
    call: null,
    isReady: false,
    currentStatus: null,
    currentNumber: null,
    communication: null,
    contact: null,
    onSpeaker: false,
    isMuted: false,
    isHeld: false,
    recordingStatus: 'in-progress',
    timer: '',
    wrapUpTimer: '',
    duration: 0,
    wrapUpDuration: '',
    parkedCall: null,
    dealId: null
  },
  warnings: [],
  shouldIntroduce: false,
  addedParty: null,
  keyboard: {
    scroll: null,
    resizeMode: null
  },
  // cached states
  sidebarFolded: false,
  currentCompany: null,
  smsTemplates: [],
  tagOptions: {
    isReset: false
  }
}
