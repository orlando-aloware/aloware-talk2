import actions from './actions';
import getters from './getters';
import mutations from './mutations';

export default {
  namespaced: true,
  state: {
    generatingStatus: {} // Tracks `isGenerating` status per communication ID
  },
  actions,
  getters,
  mutations
}
