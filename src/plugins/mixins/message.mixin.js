import { isEmpty } from 'lodash'

export default {
  methods: {
    translateMessage (message, campaign = {}, user = {}) {
      // contact variables
      let translated = message
        .replace(/\[FirstName\]/g, 'John')
        .replace(/\[LastName\]/g, 'Doe')
        .replace(/\[FullName\]/g, 'John Doe')
        .replace(/\[Email\]/g, 'john.doe@aloware.com')
        .replace(/\[Website\]/g, 'www.apple.com')
        .replace(/\[Address\]/g, 'One Infinite Loop')
        .replace(/\[CompanyName\]/g, 'Apple Inc')
        .replace(/\[ContactNotes\]/g, 'contact notes')
        .replace(/\[OwnerName\]/g, 'Zack Lee')
        .replace(/\[OwnerFirstName\]/g, 'Zack')
        .replace(/\[OwnerLastName\]/g, 'Lee')
        .replace(/\[LeadNumber\]/g, '(855) 256-2001')
        .replace(/\[City\]/g, 'Los Angeles')
        .replace(/\[State\]/g, 'CA')
        .replace(/\[FullState\]/g, 'California')
        .replace(/\[ZipCode\]/g, '00012')
        .replace(/\[Country\]/g, 'US')
        .replace(/\[DateOfBirth\]/g, '02/25/1990')
        .replace(/\[ContactId\]/g, '1234')
        .replace(/\[CSF1\]/g, 'CSF1')
        .replace(/\[CSF2\]/g, 'CSF2')

      // campaign variables
      if (!isEmpty(campaign)) {
        translated = translated
          .replace(/\[LineName\]/g, campaign.name)
          .replace(/\[TrackingNumber\]/g, this.$options.filters.fixPhone(campaign.incoming_number, 'INTERNATIONAL'))
      }

      // agent variables
      if (!isEmpty(user)) {
        translated = translated
          .replace(/\[AgentName\]/g, user.name)
          .replace(/\[AgentFirstName\]/g, user.first_name)
          .replace(/\[AgentLastName\]/g, user.last_name)
          .replace(/\[AccountName\]/g, user.company?.name)
      }

      return translated
    }
  }
}
