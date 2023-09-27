<template>
  <div class="contacts mx-0 content-row d-flex overflow-hidden h-100"
       v-if="authenticated">
    <div class="pt-0 pl-0 pr-0 mb-0 h-100 bordered-right contacts-left-sidebar"
         :class="sidebarClass"
         v-show="$route.name === 'Contacts'">
      <contacts-sidebar v-if="$route.name === 'Contacts'"/>
    </div>
    <contact-list-sidebar ref="contactListSidebar"
                          :isLoadingMore="isLoadingMore"
                          v-if="$route.name === 'Contact'"
                          @toggleContactActivities="toggleContactListSidebar"
                          @contactSelected="onContactSelected"/>
    <div class="px-0 mb-0 main flex-1"
         :class="mainClass">
      <Contact v-if="$route.name === 'Contact'"/>
      <router-view :list="list"
                   :is-loading-disabled="isLoadingDisabled"
                   :is-start-state="isStartState"
                   :is-editable="isEditable"
                   :search="search"
                   :is-my-contacts-view="isMyContactsView"
                   :is-loading="isComponentLoading"
                   :columns="columns"
                   :is-empty="isEmpty"
                   :is-loading-more="isLoadingMore"
                   :filters-count="filtersCount"
                   :on-fetch="fetch"
                   v-if="$route.name === 'Contacts' && list"
                   @search="onSearch"
                   @checkboxChanged="onFetchMyContacts"
                   @sort="onSortByField"
                   @paginated="onPaginate"
                   @loadMore="onLoadMore"
                   @onSelectedCountChange="onSelectedCountChange">
      </router-view>
    </div>
    <remove-folder-dialog v-if="isActive"/>
    <column-headers :previousRelations="previousRelations"
                    v-if="isActive"/>
    <remove-contact :selected-count="selectedContactsCount"
                    v-if="isActive"/>
    <remove-contact-confirmation :selected-count="selectedContactsCount"
                                 v-if="isActive"
                                 @contactsRemoved="onRemoveContacts"/>
    <move-dialog v-if="isActive"/>
    <create-list-modal v-if="isActive"/>
    <select-list-modal v-if="isActive"/>
    <remove-list-modal v-if="isActive"/>
    <remove-list-confirmation v-if="isActive"/>
  </div>
</template>

<script>
import ContactListSidebar from 'src/components/contacts/contact-list-sidebar'
import ContactsSidebar from 'components/contacts/contacts-sidebar.vue'
import RemoveListModal from 'components/remove-list.vue'
import RemoveFolderDialog from 'components/remove-folder.vue'
import ColumnHeaders from 'components/column-headers.vue'
import RemoveContact from 'components/remove-contact.vue'
import RemoveContactConfirmation from 'components/remove-contact-confirmation.vue'
import MoveDialog from 'components/move-dialog.vue'
import CreateListModal from 'components/create-list-modal.vue'
import SelectListModal from 'components/select-list-modal'
import RemoveListConfirmation from 'components/remove-list-confirmation'
import {
  contactsMixins,
  contactV2AttributesMixin,
  aclMixin,
  visibilityMixin,
  contactsListFiltersMixin,
  contactListCountMixin,
  mainViewMixin
} from 'src/plugins/mixins'
import { mapActions, mapGetters, mapState } from 'vuex'
import Contact from 'pages/contacts/Contact'

export default {
  name: 'Contacts',

  mixins: [
    contactsMixins,
    contactV2AttributesMixin,
    aclMixin,
    visibilityMixin,
    contactsListFiltersMixin,
    contactListCountMixin,
    mainViewMixin
  ],

  components: {
    Contact,
    RemoveListConfirmation,
    SelectListModal,
    ContactsSidebar,
    RemoveListModal,
    RemoveFolderDialog,
    RemoveContact,
    RemoveContactConfirmation,
    ColumnHeaders,
    MoveDialog,
    CreateListModal,
    ContactListSidebar
  },

  computed: {
    ...mapGetters('auth', [
      'authenticated',
      'profile'
    ]),

    ...mapState('contacts', [
      'showContactsListSidebar',
      'unsavedList'
    ]),

    ...mapState('cache', [
      'currentCompany'
    ]),

    ...mapState(['isMobile']),

    mainClass () {
      if (this.$route.name === 'Contact') {
        return 'w-100'
      }

      if (!this.$q.screen.lt.md) {
        return ''
      }

      return !this.showContactsListSidebar ? 'w-100 no-min-max-width' : 'w-0'
    },

    sidebarClass () {
      if (!this.$q.screen.lt.md) {
        return ''
      }

      return !this.showContactsListSidebar ? 'w-0' : 'w-100 no-min-max-width'
    },

    isActive () {
      return this.$route.name === 'Contacts'
    }
  },

  created () {
    this.setShowContactResourceUnavailable(false)
    this.setListContactOwner(this.profile.id)
  },

  mounted () {
    if (this.$route.name === 'Contacts') {
      this.setShowContactsHeader(true)

      // reset the table's default date column for sort
      if (this.currentCompany?.default_contact_date_filter) {
        this.setDefaultDateFilter(this.currentCompany.default_contact_date_filter)
      }
    }

    if (this.isMobile) {
      this.toggleSidebar()
    }

    this.setAllContactsSelected(false)
  },

  methods: {
    ...mapActions('contacts', [
      'setShowContactsListSidebar',
      'setShowContactsHeader',
      'setUnsavedList',
      'setListContactOwner',
      'setPreviousListFilters',
      'setPreviouslySavedListId',
      'setPreviousListId',
      'setShowContactResourceUnavailable',
      'setSelectedListContactCount'
    ]),

    ...mapActions([
      'setDefaultDateFilter'
    ]),

    toggleSidebar () {
      this.setShowContactsListSidebar(false)
    },

    toggleContactListSidebar (isOpen) {
      this.contactListSidebarOpen = isOpen

      if (typeof this.$refs.contactListSidebar !== 'undefined' && isOpen) {
        this.$refs.contactListSidebar.onSidebarToggle()
      }
    },

    onContactSelected (contact) {
      const routeParams = {
        name: 'Contact',
        params: {
          id: contact.id
        }
      }

      // we need to pass previous page flag if it exists
      // in our current route to maintain the flag
      if (this.$route?.query?.previousPage) {
        routeParams.query = {
          previousPage: this.$route.query.previousPage
        }
      }

      this.$router.push(routeParams)
        .catch(err => {
          console.log(err)
        })
    },

    onRemoveContacts () {
      this.$VueEvent.fire('fetchContacts', { clear: true, skipCountRequest: true })
    }
  },

  watch: {
    $route (to, from) {
      this.setSelectedListContactCount(0)
      this.setAllContactsSelected(false)
      this.setIsDatatableSelectedAll(false)

      if (to.name.includes('Contact')) {
        this.setShowContactResourceUnavailable(false)
      }

      // clear previous list state when moving out from Contacts page
      if (to.name !== 'Contacts' && from?.name === 'Contacts') {
        this.setPreviousListFilters({})
        this.setPreviouslySavedListId(null)
        this.setPreviousListId(null)
      }

      if (to.name.includes('Contacts')) {
        if (from.name !== 'Contacts') {
          this.setUnsavedList(null)
        }

        this.setShowContactsHeader(true)
        this.setShowContactsListSidebar(false)
      }

      this.initiateUpdateContactsListFilter({
        forPreviousList: true,
        fromName: from.name,
        toName: to.name
      })

      if (to.name === 'Contact' && this.$q.screen.lt.md) {
        this.setShowContactsHeader(false)
      }
    }
  },

  beforeDestroy () {
    this.$VueEvent.stop('fetchContactsLists')
  },

  beforeRouteLeave (to, from, next) {
    if (this.unsavedList) {
      this.$bvModal.msgBoxConfirm('You have an unsaved contacts list. This action may cause your unsaved contact list to be lost. Do you wish to continue?', {
        buttonSize: 'sm',
        okTitle: 'Yes',
        cancelTitle: 'No',
        centered: true
      }).then(confirm => {
        if (confirm) {
          this.setUnsavedList(null)
          this.setAllContactsSelected(false)

          // set the contacts list to 'All Contacts'
          const list = { data: null, found: null }

          for (list.data in this.lists) {
            if (this.lists[list.data].id.toString() === 'all') {
              list.found = this.lists[list.data]
              break
            }
          }

          if (to.name !== 'Contact' || !list.found) {
            next()
          }

          this.setSelectedList({ id: list.found.id, name: list.found.name, type: list.found.type })
          this.setCurrentListFilters(list.found.filters)
          this.$VueEvent.fire('clearContacts')
          this.$VueEvent.fire('fetchContacts', { clear: true, isLoading: true })
          this.$VueEvent.fire('shouldUpdateListCount')

          next()
          return
        }

        next(false)
      })

      return
    }

    if (to.name !== 'Contact') {
      this.stopEvents()
    }

    this.stopMainViewEvents()

    setTimeout(() => {
      this.setAllContactsSelected(false)
      next()
    }, 100)
  }
}
</script>
