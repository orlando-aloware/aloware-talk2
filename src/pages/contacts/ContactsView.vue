<template>
  <contacts-screen v-if="list" :loading="isLoadingDisabled">
    <template slot="title">
      <div class="d-flex flex-column">
        <div class="pr-2">{{ list.name }}</div>
        <div class="small text-muted">
          {{ listItemsTotalContacts | numFormat }} contacts found
        </div>
      </div>
    </template>
    <template slot="options">
      <compact-btn
        variant="primary"
        v-if="list.type === ContactListType.DYNAMIC && isEditable"
        @clicked="onFiltersClicked"
      >
        <i class="fa fa-plus mr-2"></i> Add Filters
      </compact-btn>
    </template>

    <template slot="actions">
      <div class="col-lg-6 px-0 mb-2 mb-lg-0 d-flex align-items-center">
        <search
          class="width-250"
          :search="search"
          @search="onSearch"
          :disabled="isLoadingDisabled">
        </search>
        <div class="px-3 d-inline-flex" v-if="!isMyContactsView">
          <label for="my-contacts" class="text-primary mr-2 mt-2 cursor-pointer">My Contacts</label>
          <b-form-checkbox
            id="my-contacts"
            class="mt-2 cursor-pointer"
            name="check-button"
            size="sm"
            switch
            v-model="myContacts"
            @change="onFetchMyContacts"
          >
          </b-form-checkbox>
        </div>
      </div>
      <div class="col-lg-6 px-0 d-flex align-items-center">
        <div class="flex-grow-1"></div>
        <div class="mr-4">
          <span class="small text-muted">{{ listItemsDataCount }} of {{ listItemsTotalContacts }} Contacts</span>
        </div>
        <compact-btn
          borderless
          :variant="filterButtonVariant"
          customClass="mr-2"
          @clicked="onFiltersClicked"
        >
          Filters
          <b-badge class="ml-1 mt-1"
                   pill
                   :variant="filterBadgeVariant">
            {{ filtersCount }}
          </b-badge>
        </compact-btn>
        <compact-btn
          customClass="mr-2"
          borderless
          :variant="resetButtonVariant"
          :disabled="isResetDisabled"
          @clicked="resetFilters"
        >
          Reset
        </compact-btn>
        <compact-btn
          variant="primary"
          :disabled="!filterHasChanges || this.defaultIds.includes(this.id) || isUpdatingList"
          :customClass="saveFilterButtonCustomClass"
          @clicked="onUpdateContactList">
          <q-spinner-bars v-if="isUpdatingList"
                          color="white"
                          class="mr-1"/>
          {{ isUpdatingList ? ' Saving...' : 'Save' }}
        </compact-btn>
        <b-dropdown text="Add Contacts"
                    no-caret
                    right
                    variant="primary"
                    class="m-2 b-compact-dropdown-button text-bold"
                    v-if="(list.type === ContactListType.STATIC && isEditable) || this.id === 'all'">
          <b-dropdown-item href="#"
                           :disabled="!(list.type === ContactListType.STATIC && isEditable)"
                           @click="onAddContactsToList">
            <i class="fa fa-search mr-1"></i> Select Contact
          </b-dropdown-item>
          <b-dropdown-item href="#" v-b-modal:create-contact-modal>
            <i class="fa fa-plus mr-1"></i>
            Create Contact
          </b-dropdown-item>
        </b-dropdown>

        <contact-create-modal @created="onContactCreated"></contact-create-modal>

        <b-dropdown text="..."
                    no-caret
                    right
                    variant="outline-secondary"
                    class="m-2 b-compact-dropdown-button text-bold">
          <b-dropdown-item href="" @click="onEditColumnsClicked"><i class="fa fa-bars"></i> Edit Columns</b-dropdown-item>
          <b-dropdown-item href="#" :disabled="true"><i class="fa fa-crosshairs"></i> Power Dialer</b-dropdown-item>
          <b-dropdown-item href="#" :disabled="true"><i class="fa fa-file-csv"></i> Export as CSV</b-dropdown-item>
          <b-dropdown-item href=""
                           :disabled="isListDeletable"
                           @click="onRemoveList">
            <i class="fa fa-trash-alt"></i> Delete
          </b-dropdown-item>
        </b-dropdown>
      </div>
    </template>
    <template slot="actions">
      <bulk-action-menu :id="id" v-if="checked.length > 0"></bulk-action-menu>
    </template>

    <template slot="table">
      <datatable
        :stickyHeaders="true"
        :columns="columns"
        :hasMore="hasMore"
        :isEmpty="isEmpty || isStartState"
        :isLoadingMore="isLoadingMore"
        :contact-list-id="id"
        @reordered="onColumnsReordered"
        @checked="onCheckAllItems"
        @sort="onSortByField"
        @more="onLoadMore">
        <template slot="tbody">
          <table-row
            v-for="(contact, index) in listItems[id].data"
            :key="contact.id + index + Math.random()"
            :contact="contact"
            :columns="columns"
            :checked="checked"
            :contactListId="id"
            @checked="onCheckedRows"
          />
        </template>

        <template slot="empty" v-if="isStartState">
          <router-link
            v-slot="{ navigate }"
            :to="'/contacts/list/' + $route.params.id + '/add'"
          >
            <div class="start-state" @click="navigate">
              <div
                class="p-4 bg-light w-100 text-center border-bottom text-primary"
              >
                <template v-if="list.type == ContactListType.STATIC">
                  Add contacts <i class="fa fa-plus"></i>
                </template>
                <template v-else-if="list.type == ContactListType.DYNAMIC">
                  Add Contacts through a Filter <i class="fa fa-plus"></i>
                </template>
              </div>
            </div>
          </router-link>
        </template>
      </datatable>
    </template>
    <template slot="filters">
      <contacts-filters @filtersUpdated="updateFilterHasChanges"
                        @filtersCount="updateFiltersCount"/>
    </template>
    <template slot="footer">
      <import-contacts-modal ref="importContacts" />
    </template>
  </contacts-screen>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import contactsMixins from 'src/plugins/mixins/contacts.mixin'
import _ from 'lodash'
import BulkActionMenu from 'src/components/bulk-action-menu'
import CompactBtn from 'src/components/compact-btn.vue'
import ContactsScreen from 'src/components/contacts/contacts-screen.vue'
import Search from 'src/components/search.vue'
import Datatable from 'src/components/datatable.vue'
import ImportContactsModal from 'src/components/import-contacts-modal.vue'
import TableRow from 'src/components/table-row.vue'
import ContactsFilters from 'src/components/contacts/contacts-filters'
import { FROM_FILTERS } from 'src/constants/contacts-list-create-mode'
import { DEFAULT_CONTACT_LIST } from 'src/constants/contacts-list-types'
import ContactCreateModal from 'components/contacts/contact-create-modal'
import talk2Api from 'src/plugins/api/api'

export default {
  components: {
    ContactCreateModal,
    ContactsFilters,
    BulkActionMenu,
    CompactBtn,
    ContactsScreen,
    Search,
    Datatable,
    ImportContactsModal,
    TableRow
  },
  mixins: [contactsMixins],
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      filterHasChanges: false,
      defaultContactLists: DEFAULT_CONTACT_LIST,
      isUpdatingList: false
    }
  },
  methods: {
    ...mapActions('contacts', [
      'columnsOpen',
      'openFilters',
      'closeFilters',
      'contactsLoaded',
      'columnsReordered',
      'setListSelectedContacts',
      'setSelectedList',
      'createListOpen',
      'setCurrentListFilters',
      'removeListOpen',
      'resetSearch'
    ]),
    onColumnsReordered (nextColumns) {
      this.columnsReordered({
        id: this.id,
        headers: nextColumns
      })
    },
    onCheckAllItems (checked) {
      let items = []
      let _this = this
      document
        .querySelectorAll('.checker')
        .forEach(function (checkbox) {
          if (checked) {
            items.push(_this.listItems[_this.id].data.find(item => item.id === Number(checkbox.value)))
          } else {
            items = items.filter(item => item.id !== Number(checkbox.value))
          }
        })

      this.setListSelectedContacts({ id: this.id, contacts: items })
    },
    onCheckedRows (checked) {
      this.setListSelectedContacts({ id: this.id, contacts: checked })
    },
    onEditColumnsClicked () {
      this.columnsOpen({
        id: this.id,
        headers: this.columns,
        name: this.list.name
      })
    },
    onImportContactsClicked () {
      this.$refs.importContacts.open()
    },
    onFiltersClicked () {
      if (this.isFiltersOpen) {
        this.closeFilters()
      } else {
        this.openFilters()
      }
    },
    onCreateStaticList () {
      this.createListOpen({
        type: 1,
        mode: FROM_FILTERS,
        contact_folder_id: null
      })
    },
    onCreateDynamicList () {
      this.createListOpen({
        type: 2,
        mode: FROM_FILTERS,
        contact_folder_id: null
      })
    },
    onUpdateContactList () {
      if (this.selectedList.type === this.ContactListType.STATIC || this.defaultIds.includes(this.id)) {
        return
      }
      this.isUpdatingList = true
      return this.$axios
        .put('/api/v2/contacts-list/' + this.selectedList.id, { filters: this.currentListFilters })
        .then(() => {
          this.initialListFilters = this.currentListFilters
          this.updateFilterHasChanges()
          this.isUpdatingList = false
          this.$generalNotification('Changes to contact list has been saved.')
        })
        .catch((_err) => {
          this.$generalNotification('Unable to update contact list.', 'error')
        })
    },
    updateFiltersCount (count) {
      this.filtersCount = count
    },
    onAddContactsToList () {
      this.$router.push(`/contacts/list/${this.$route.params.id}/add`)
    },
    onRemoveList () {
      this.removeListOpen({ id: this.selectedList.id, name: this.selectedList.name })
    },
    hasFilterChanges () {
      return JSON.stringify(this.initialListFilters) !== JSON.stringify(this.currentListFilters)
    },
    updateFilterHasChanges () {
      this.filterHasChanges = this.hasFilterChanges()
    },
    resetFilters (resetSearch = false) {
      const defaultFilters = this.fixDefaultFilters()
      this.setCurrentListFilters(defaultFilters)
      if (resetSearch) {
        this.resetSearch()
      }
      this.$VueEvent.fire('filters-reset')
      this.filterHasChanges = false
    },
    onContactCreated (contact) {
      if (this.list.type === this.ContactListType.STATIC) {
        talk2Api.V2.contactListItem.addContact(this.id, [contact]).then(res => {
          this.fetch()
        })
      } else {
        this.fetch({
          page: this.listItems[this.id].current_page
        })
      }
    }
  },
  computed: {
    ...mapGetters('auth', ['profile']),
    ...mapGetters('contacts', ['lists', 'listItems', 'selectedContacts', 'isFiltersOpen', 'selectedList', 'currentListFilters']),
    checked () {
      return this.selectedContacts[this.id] || []
    },
    saveFilterButtonClass () {
      return {
        'disabledButton': this.selectedList.type === this.ContactListType.STATIC ||
          (this.selectedList.type === this.ContactListType.DYNAMIC &&
            !this.filterHasChanges) ||
          this.defaultIds.includes(this.id)
      }
    },
    listItemsDataCount () {
      const total = _.get(this.listItems, `[${this.id}].data.length`, null)
      return total !== null ? total : 0
    },
    listItemsTotalContacts () {
      const total = _.get(this.listItems, `[${this.id}].total`, null)
      return total !== null ? total : 0
    },
    filterButtonVariant () {
      return this.isFiltersOpen ? 'primary' : 'outlined-light'
    },
    filterBadgeVariant () {
      return this.isFiltersOpen ? 'light' : 'primary'
    },
    resetButtonVariant () {
      return this.filterHasChanges ? 'primary' : 'outlined-light'
    },
    saveFilterButtonVariant () {
      return this.filterHasChanges ? 'primary' : 'secondary'
    },
    saveFilterButtonCustomClass () {
      return !this.filterHasChanges ? 'button-disabled' : ''
    },
    isResetDisabled () {
      return !this.filterHasChanges
    },
    isListDeletable () {
      // eslint-disable-next-line no-unused-vars
      for (const [key, list] of Object.entries(this.defaultContactLists)) {
        if (list.id === this.selectedList.id) {
          return true
        }
      }

      return false
    }
  },
  mounted () {
    this.fetch()
    // force close filter
    // this.closeFilters()
  },
  watch: {
    '$route.params.id': function () {
      this.resetFilters()
      this.initialListFilters = this.currentListFilters
      this.myContacts = false
    },
    currentListFilters: {
      deep: true,
      handler: function () {
        this.fetch(typeof this.currentListFilters === 'string' ? [] : this.currentListFilters)
        this.filtersCount = this.getFiltersCount(this.currentListFilters)
      }
    },
    selectedList: function (value) {
      if (this.selectedContacts[value.id]) {
        this.setListSelectedContacts({ id: value.id, contacts: [] })
      }
    }
  }
}
</script>
