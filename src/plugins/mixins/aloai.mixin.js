import _ from 'lodash'
import { ALOAI_USE_CASES } from '../../constants/aloai'

export default _.merge({
  methods: {
    formatUseCase (useCase) {
      switch (useCase) {
        case ALOAI_USE_CASES.SALES:
          return 'Sales'
        case ALOAI_USE_CASES.QUESTION_AND_ANSWER:
          return 'Q&A'
        case ALOAI_USE_CASES.SUPPORT:
          return 'Support'
        default:
          return 'Unknown'
      }
    }
  }
})
