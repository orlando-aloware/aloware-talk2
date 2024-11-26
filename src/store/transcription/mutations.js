export default {
    SET_GENERATING_STATUS(state, { communicationId, status }) {
      state.generatingStatus = {
        ...state.generatingStatus,
        [communicationId]: status
      }
    }
  }
  