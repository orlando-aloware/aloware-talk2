export default {
    isGenerating: state => communicationId => !!state.generatingStatus[communicationId]
  }
  