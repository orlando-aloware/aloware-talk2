export default function () {
  return {
    calls: {
      queued: [],
      live: [],
      parked: []
    },
    callsEnabledColumns: [
      'details',
      'disposition',
      'incoming_number',
      'ring_group',
      'workflow',
      'created_at',
      'lead_number',
      'location',
      'callback_status',
      'tags',
      'notes',
      'operations'
    ],
    filters: {
      ringGroup: null,
      agent: null
    },
    isLiveCallsLoading: false,
    isParkedCallsLoading: false,
    isQueuedCallsLoading: false,
    isSummaryLoading: false,
    isUsersLoading: false,
    summary: {
      abandonedCalls: 0,
      answeredCalls: 0,
      appointmentsSet: 0,
      averageTalkTime: 0,
      averageWaitTime: 0,
      emailsReceived: 0,
      emailsSent: 0,
      faxesReceived: 0,
      faxesSent: 0,
      missedCalls: 0,
      remindersSet: 0,
      smsReceived: 0,
      smsSent: 0,
      textsReceived: 0,
      textsSent: 0,
      totalCalls: 0,
      totalOccupancy: 0
    },
    users: [],
    viewMode: 'comfort' // comfort, compact
  }
}
