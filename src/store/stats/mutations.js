export default {
  SET_METRICS: (state, data) => {
    state.metrics = data
  },
  SET_REPORT_GROUP: (state, data) => {
    state.report_group = data
  },
  REMOVE_METRICS: (state, data) => {
    let selectedKey = null
    state.metrics.forEach((metric, key) => {
      if (metric.id === data) {
        selectedKey = key
      }
    })
    state.metrics.splice(selectedKey, 1)
  }
  // SET_REPORT_GROUP: (state, data) => {
  //   console.log('data : ', data)
  //   // Temporary implementation
  //   state.report_group = [
  //     {
  //       id: '1',
  //       name: 'Sales Daily Pipeline',
  //       timeline: 'Today',
  //       metrics: [
  //         {
  //           id: '1',
  //           name: '# of calls',
  //           value: '123'
  //         },
  //         {
  //           id: '2',
  //           name: '# of connected',
  //           value: '77'
  //         },
  //         {
  //           id: '3',
  //           name: '# of interested',
  //           value: '11'
  //         }
  //       ]
  //     },
  //     {
  //       id: '2',
  //       name: 'Technical Support',
  //       timeline: 'Recent (Last 30 days + Today)',
  //       metrics: [
  //         {
  //           id: '4',
  //           name: 'Answered',
  //           value: '77'
  //         },
  //         {
  //           id: '5',
  //           name: 'Missed',
  //           value: '12'
  //         }
  //       ]
  //     },
  //     {
  //       id: '3',
  //       name: 'User Status Breakdown',
  //       timeline: 'This Week',
  //       metrics: [
  //         {
  //           id: '6',
  //           name: 'Available',
  //           value: '30m'
  //         },
  //         {
  //           id: '7',
  //           name: 'On Call',
  //           value: '5h 20m'
  //         },
  //         {
  //           id: '8',
  //           name: 'On Break',
  //           value: '9m'
  //         }
  //       ]
  //     }
  //   ]
  // }
}
