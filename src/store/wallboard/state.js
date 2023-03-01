export default function () {
  return {
    calls: {
      queued: [],
      live: [],
      parked: []
    },
    filters: {
      ringGroup: null
    },
    isLoadingUsers: false,
    isLoadingQueuedCalls: false,
    isLoadingLiveCalls: false,
    isLoadingParkedCalls: false,
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
