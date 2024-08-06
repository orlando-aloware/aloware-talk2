import { mapState } from 'vuex'
import * as AnswerTypes from '../../constants/answer-types'
import _ from 'lodash'
import * as storage from 'src/plugins/helpers/storage'

export default {
  computed: {
    ...mapState(['users']),

    ...mapState('cache', ['currentCompany']),

    isInboxViewsEnabledCompany () {
      const companyIds = [1261, 1568] // JobNimbus, Cardone Ventures
      return companyIds.includes(this.profile.company_id)
    },

    isModGen () {
      return [2132, 3691].includes(this.currentCompany?.reseller_id)
    }
  },

  methods: {
    getUser (id) {
      const users = _.get(this, 'users', null)

      if (!id || !users || users.length === 0) {
        console.log('Users not loaded')
        return {
          id: id,
          name: ''
        }
      }

      const found = users.find(user => user.id === id)

      if (found) {
        console.log('Founded user', found)
        return found
      }

      console.log('Users loaded, but user id not found', id)

      return {
        id: id,
        name: ''
      }
    },

    getUserName (user) {
      if (!user) {
        return
      }

      // sanity check
      if (!user.id) {
        return
      }

      if (user.answer_by !== undefined) {
        switch (user.answer_by) {
          case AnswerTypes.BY_BROWSER:
            return user.name + ' - Browser / Apps'
          case AnswerTypes.BY_IP_PHONE:
            return user.name + ' - SIP (IP Phone)'
          case AnswerTypes.BY_PHONE_NUMBER:
            return user.name + ' - Phone Number (' + user.phone_number + ')'
          case AnswerTypes.BY_NONE:
            return user.name + ' - Will Not Answer'
        }
      }

      switch (true) {
        case user.name !== '' && user.name && !user.sip_uri:
          return user.name + ' (' + user.phone_number + ')'
        case user.name !== '' && user.name && user.sip_uri:
          return user.name + ' - SIP'
        case !user.name && user.sip_uri:
          return 'No Name - SIP'
        default:
          return 'No Name (' + user.phone_number + ')'
      }
    },

    isCompanyPartOfAlowareDemoCompanies (companyId) {
      return storage.local.getItem('aloware_demo_companies') && storage.local.getItem('aloware_demo_companies').split(',').includes(String(companyId))
    },

    // Temporary function to check if company is part of new inbox filters
    // should be removed once all companies are migrated to new inbox filters
    isCompanyPartOfNewInboxFilters (companyId) {
      // Disabled because query is too slow in production
      return false

      // const demoCompanies = storage.local.getItem('aloware_demo_companies') ? storage.local.getItem('aloware_demo_companies').split(',') : []
      // demoCompanies.push('568') // Quill & Arrow account
      // return demoCompanies.includes(String(companyId))
    },

    isCompanyPartOfCustomEdgeLocations (companyId) {
      return storage.local.getItem('custom_edge_location_companies') && storage.local.getItem('custom_edge_location_companies').split(',').includes(String(companyId))
    }
  }
}
