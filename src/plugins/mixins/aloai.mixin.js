import _ from 'lodash'
import { AloAiUseCases } from '../../constants/aloai'

export default _.merge({
  methods: {
    formatUseCase (useCase) {
      switch (useCase) {
        case AloAiUseCases.SALES:
          return 'Sales'
        case AloAiUseCases.QUESTION_AND_ANSWER:
          return 'Q&A'
        case AloAiUseCases.SUPPORT:
          return 'Support'
        default:
          return 'Unknown'
      }
    },
    useCaseColor (status) {
      return (
        {
          [AloAiUseCases.SALES]: 'green-6',
          [AloAiUseCases.SUPPORT]: 'blue-gray-6',
          [AloAiUseCases.QUESTION_AND_ANSWER]: 'orange-6'
        }[status] || 'black'
      )
    }
  }
})
