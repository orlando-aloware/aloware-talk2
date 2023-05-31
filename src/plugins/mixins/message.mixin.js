// import { COUNTRIES } from 'src/constants/countries'
import AreaCodes from 'src/us-area-code-state.json'
import { isEmpty } from 'lodash'

export default {
  methods: {
    translateMessage (message, contact = {}, campaign = {}, user = {}) {
      let translated = message

      // contact variables
      if (!isEmpty(contact)) {
        translated = translated
          .replace(/\[FirstName\]/g, contact.first_name || '')
          .replace(/\[LastName\]/g, contact.last_name || '')
          .replace(/\[FullName\]/g, contact.name || '')
          .replace(/\[Email\]/g, contact.email || '')
          .replace(/\[Website\]/g, contact.website || '')
          .replace(/\[Address\]/g, contact.address || '')
          .replace(/\[CompanyName\]/g, contact.company_name || '')
          .replace(/\[ContactNotes\]/g, contact.notes || '')
          .replace(/\[OwnerName\]/g, contact.user?.name || '')
          .replace(/\[OwnerFirstName\]/g, contact.user?.first_name || '')
          .replace(/\[OwnerLastName\]/g, contact.user?.last_name || '')
          .replace(/\[LeadNumber\]/g, this.$options.filters.fixPhone(this.contact.phone_number, 'INTERNATIONAL'))
          .replace(/\[City\]/g, contact.cnam_city || '')
          .replace(/\[State\]/g, contact.cnam_state || '')
          .replace(/\[FullState\]/g, AreaCodes.find(a => a.state_code === this.contact.cnam_state)?.state_name)
          .replace(/\[ZipCode\]/g, contact.cnam_zipcode || '')
          .replace(/\[Country\]/g, contact.cnam_country || '')
          .replace(/\[DateOfBirth\]/g, contact.date_of_birth ? window.moment(this.contact.date_of_birth).format('MM/DD/YYYY') : '')
          .replace(/\[ContactId\]/g, contact.id)
          .replace(/\[CSF1\]/g, contact.csf1 || '')
          .replace(/\[CSF2\]/g, contact.csf2 || '')
      }

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
