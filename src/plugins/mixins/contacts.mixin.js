import {
  DEFAULT_CONTACT_LIST,
  OPERATORS
} from 'src/constants/contacts-list-types'

export default {
  methods: {
    // eslint-disable-next-line space-before-function-paren
    buildQueryParameters(params, filters = {}) {
      const invalidIds = Object.keys(DEFAULT_CONTACT_LIST).map(
        (k) => DEFAULT_CONTACT_LIST[k].id
      )

      const query = {
        page: 1
      }

      query.filters = { ...filters }

      if (this.id === DEFAULT_CONTACT_LIST.UNANSWERED.id) {
        query.filters.is_unanswered_contact = {}
        query.filters.is_unanswered_contact.value = 1
      }

      if (this.id === DEFAULT_CONTACT_LIST.UNASSIGNED.id) {
        query.filters.is_unassigned = {}
        query.filters.is_unassigned.value = 1
      }

      if (this.id === DEFAULT_CONTACT_LIST.NEWLEADS.id) {
        query.filters.is_new_contact = {}
        query.filters.is_new_contact.value = 1
      }

      if (this.id === DEFAULT_CONTACT_LIST.MY_CONTACTS.id || this.myContacts) {
        query.filters.contact_owner = {}
        query.filters.contact_owner.value = [this.profile.id]
        query.filters.contact_owner.operator = OPERATORS.IS_ANY_OF
      }

      if (
        this.$route.params.id &&
        !invalidIds.includes(this.$route.params.id)
      ) {
        query.filters.contact_lists = {}
        query.filters.contact_lists.value = [this.$route.params.id]
        query.filters.contact_lists.operator = OPERATORS.IS_ANY_OF
      }

      if (params.search) {
        query.filters.search = {}
        query.filters.search.value = [params.search]
      }

      if (params.page) {
        query.page = params.page
      }

      return query
    }
  }
}
