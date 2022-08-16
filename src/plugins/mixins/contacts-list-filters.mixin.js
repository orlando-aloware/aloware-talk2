import { get } from 'lodash'
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  computed: {
    ...mapState('contacts', [
      'selectedList',
      'previousListId',
      'previousListFilters'
    ]),
    ...mapGetters('contacts', [
      'pinnedLists'
    ])
  },
  methods: {
    ...mapActions('contacts', [
      'updateContactsListFilter'
    ]),
    initiateUpdateContactsListFilter (data = {}) {
      const forPreviousList = get(data, 'forPreviousList', false)
      const routeFromName = get(data, 'routeFromName', null)
      const routeToName = get(data, 'routeToName', null)
      const oldIdValue = get(data, 'oldIdValue', null)
      const selectedListId = get(this.selectedList, 'id', null)
      const pinnedListFound = this.pinnedLists.find(pinnedList => String(pinnedList.id) === String(selectedListId))

      if (
        ((!forPreviousList &&
          !routeFromName &&
          !routeToName) ||
        (forPreviousList &&
          routeFromName &&
          routeToName &&
          routeFromName === 'Contacts' &&
          routeToName === 'Contacts' &&
          this.previousListId) ||
        (oldIdValue !== null &&
          this.$route.name === 'Contacts')) &&
        selectedListId &&
        !pinnedListFound) {
        this.processUpdateContactsListFilter()
        return
      }

      const currentListFilters = this.currentListFilters !== undefined ? this.currentListFilters : undefined
      const showMyContacts = this.showMyContacts !== undefined ? this.showMyContacts : undefined

      if (this.$route.name === 'Contacts' &&
        selectedListId &&
        !pinnedListFound &&
        typeof this.resetFilters === 'function' &&
        this.initialListFilters !== undefined &&
        this.myContacts !== undefined &&
        typeof this.setShouldUpdateSelectedListContactCount === 'function') {
        this.resetFilters()
        this.initialListFilters = currentListFilters
        this.myContacts = showMyContacts
        this.setShouldUpdateSelectedListContactCount(true)
      }
    },
    processUpdateContactsListFilter () {
      this.updateContactsListFilter({
        id: this.previousListId,
        filters: this.previousListFilters
      })
    }
  }
}
