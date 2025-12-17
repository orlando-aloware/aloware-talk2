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
    initiateUpdateContactsListFilter (params = {}) {
      const data = {
        forPreviousList: get(params, 'forPreviousList', false),
        routeFromName: get(params, 'routeFromName', null),
        routeToName: get(params, 'routeToName', null),
        oldIdValue: get(params, 'oldIdValue', null),
        selectedListId: get(this.selectedList, 'id', null),
        pinnedListFound: null,
        currentListFilters: this.currentListFilters !== undefined
          ? this.$jsonClone(this.currentListFilters)
          : undefined,
        showMyContacts: this.showMyContacts !== undefined ? this.showMyContacts : undefined
      }
      data.pinnedListFound = this.pinnedLists.find(pinnedList => String(pinnedList.id) === String(data.selectedListId))

      if (this.$route.name === 'Contacts' &&
        data.selectedListId &&
        !data.pinnedListFound &&
        typeof this.resetFilters === 'function' &&
        this.initialListFilters !== undefined &&
        this.myContacts !== undefined &&
        typeof this.setShouldUpdateSelectedListContactCount === 'function') {
        this.resetFilters()
        this.initialListFilters = data.currentListFilters
        this.myContacts = data.showMyContacts
        this.setShouldUpdateSelectedListContactCount(true)
        return
      }

      if (
        ((!data.forPreviousList &&
            !data.routeFromName &&
            !data.routeToName) ||
          (data.forPreviousList &&
            data.routeFromName &&
            data.routeToName &&
            data.routeFromName === 'Contacts' &&
            data.routeToName === 'Contacts' &&
            this.previousListId) ||
          (data.oldIdValue !== null &&
            this.$route.name === 'Contacts')) &&
        data.selectedListId &&
        !data.pinnedListFound) {
        this.processUpdateContactsListFilter()
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
