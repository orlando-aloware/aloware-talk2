import { mapState } from 'vuex'
import * as AnswerTypes from '../../constants/answer-types'
import { get, isEmpty } from 'lodash'
import * as storage from 'src/plugins/helpers/storage'

export default {
  computed: {
    ...mapState(['users', 'usersIsLoading']),

    ...mapState('cache', ['currentCompany']),

    isInboxViewsEnabledCompany () {
      const companyIds = [1261, 1568] // JobNimbus, Cardone Ventures
      return companyIds.includes(this.profile.company_id)
    },

    isModGen () {
      return this.currentCompany?.reseller_id === 2132
    },

    isImpersonate () {
      return localStorage.getItem('impersonate') === 'true'
    },

    /*
      WAT-1105:
        > IF environment variable is FALSE:
          - nothing changes for any company

        > IF environment variable is TRUE:
          - For Aloware demo companies:
            - new Communications menu is enabled showing the communications logs table
            - hidding channels and view from both Inboxes and Communications menus

          - For all other companies:
            - new Communications menu not shown
            - Inbox menu has no changes, that means is named still "Communications" and shows the channels and view

    */
    hasNewCommunicationsFeatureEnabled () {
      // TODO: remove this console log once confirmed the assert its working
      console.log('in hasNewCommunicationsFeatureEnabled ', process.env.NEW_COMMUNICATIONS_FEATURE_ENABLED)
      return this.isCompanyPartOfAlowareDemoCompanies(this.profile.company_id) && process.env.NEW_COMMUNICATIONS_FEATURE_ENABLED
    }
  },

  methods: {
    getUser (id) {
      const users = get(this, 'users', null)

      if (!id || !users || users.length === 0) {
        return {
          id: id,
          name: ''
        }
      }

      const found = users.find(user => user.id === id)

      if (found) {
        return found
      }

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
        case user.phone_number:
          return 'No Name (' + user.phone_number + ')'
        default:
          return 'Deleted User'
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
    },

    // Filters users by excluding those with read-only access and a single/undefined role,
    // or those with `answer_by` set to `BY_NONE`.
    filterUsers (users) {
      if (isEmpty(users)) return []

      return users.filter((user) => {
        const hasSingleOrUndefinedRole = typeof user.role_names === 'undefined' || user.role_names.length === 1

        return !(hasSingleOrUndefinedRole && user.read_only_access) && user.answer_by !== AnswerTypes.BY_NONE
      })
    }
  }
}
