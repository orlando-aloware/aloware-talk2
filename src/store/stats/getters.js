export default {
  reportGroup: (state) => {
    let data = []
    let temp = []
    state.report_group.forEach(rg => {
      temp = rg
      let m = []
      state.metrics.forEach(mt => {
        if (rg.id === mt.reportId) {
          m.push(mt)
        }
        temp['metrics'] = m
      })
      data.push(temp)
    })
    return data
  }
}
