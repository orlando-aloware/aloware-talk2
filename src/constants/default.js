export const DEFAULT_STATE = {
  filter: {},
  campaigns: [],
  users: [],
  ring_groups: [],
  workflows: [],
  changelogs: [],
  disposition_statuses: [],
  call_dispositions: [],
  filters: [],
  first_login: false,
  user_status: false,
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
    timer: '',
    wrapUpTimer: '',
    duration: 0,
    wrapUpDuration: '',
    onHoldCall: null,
    dealId: null
  },
  warnings: [],
  shouldIntroduce: false,
  addedParty: null,
  keyboard: {
    scroll: null,
    resizeMode: null
  }
}
