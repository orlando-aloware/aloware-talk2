import _ from 'lodash'
import * as AloAi from '../../constants/aloai'

export default _.merge({
  methods: {
    formatUseCase (useCase) {
      switch (useCase) {
        case AloAi.USE_CASES.SALES:
          return 'Sales'
        case AloAi.USE_CASES.QUESTION_AND_ANSWER:
          return 'Q&A'
        case AloAi.USE_CASES.SUPPORT:
          return 'Support'
        default:
          return 'Unknown'
      }
    },
    useCaseColor (status) {
      return (
        {
          [AloAi.USE_CASES.SALES]: 'green-6',
          [AloAi.USE_CASES.SUPPORT]: 'blue-gray-6',
          [AloAi.USE_CASES.QUESTION_AND_ANSWER]: 'orange-6'
        }[status] || 'black'
      )
    }
  }
})
