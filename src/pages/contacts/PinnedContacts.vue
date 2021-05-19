<template>
  <contacts-screen :loading="isLoadingDisabled">
    <template slot="title">
      <div class="pr-2">{{ currentPinnedContactListName }}</div>
      <span class="small text-muted"
        >{{ totalContactsCount }} contacts found</span
      >
    </template>
    <template slot="actions">
      <div class="col-lg-6 px-0 mb-2 mb-lg-0 d-flex align-items-center">
        <contacts-table-search
          @search="onSearch"
          :disabled="isLoadingDisabled"
        ></contacts-table-search>
        <div class="px-3">
          <b-form-checkbox
            v-model="myContacts"
            name="check-button"
            size="sm"
            switch
            @change="onFetchMyContacts"
          >
            <span class="small text-muted text-uppercase">My Contacts</span>
          </b-form-checkbox>
        </div>
      </div>
      <div class="col-lg-6 px-0 d-flex align-items-center">
        <div class="flex-grow-1"></div>
        <compact-btn
          variant="primary"
          customClass="mr-2"
          :onClick="onFiltersClicked"
        >
          <span class="mr-2">Filters</span>
          <b-badge variant="light">4</b-badge>
        </compact-btn>
        <compact-btn
          variant="outlined-light"
          customClass="mr-2"
          :onClick="onEditColumnsClicked"
        >
          <i class="fa fa-chevron-down text-success mr-1"></i> Edit Columns
        </compact-btn>
        <compact-btn variant="success">Save</compact-btn>
      </div>
    </template>

    <template slot="table">
      <datatable
        :stickyHeaders="true"
        :columns="columns"
        :hasMore="hasMore"
        :isEmpty="isEmpty"
        :isLoadingMore="isLoadingMore"
        @reordered="onColumnsReordered"
        @checked="onCheckAllItems"
        @sort="onSortByField"
        @more="onLoadMore"
      >
        <table-row
          v-for="(contact, index) in contactsListItems"
          :key="contact.id + index + Math.random()"
          :contact="contact"
          :columns="columns"
          :checked="checked"
          :contactListId="1"
          @checked="onCheckedRows"
        />
      </datatable>
    </template>

    <template slot="footer">
      <import-contacts-modal ref="importContacts" />
    </template>
  </contacts-screen>
</template>

<script>
import { createContactFilters } from './filters'
import { mapActions, mapGetters } from 'vuex'
import { DEFAULT_COLUMNS } from 'src/constants/columns'
import * as ContactListTypes from '../../constants/contacts-list-types'
import CompactBtn from 'src/components/buttons/compact-btn.vue'
import ContactsScreen from './_components/contacts-screen.vue'
import ContactsTableSearch from 'src/pages/contacts/_components/contacts-table-search.vue'
import Datatable from 'src/components/datatable/datatable.vue'
import ImportContactsModal from 'src/pages/contacts/_components/import-contacts-modal.vue'
import moment from 'moment'
import _ from 'lodash'
import TableRow from 'src/pages/contacts/_components/table-row.vue'

export default {
  components: {
    CompactBtn,
    ContactsScreen,
    ContactsTableSearch,
    Datatable,
    ImportContactsModal,
    TableRow
  },
  methods: {
    ...mapActions('contacts', [
      'columnHeadersOpen',
      'openFilters',
      'contactsLoaded'
    ]),
    onSortByField (orderBy) {
      this.isLoaded = false
      this.fetch({
        search_text: this.searchText,
        page: this.mycontacts.current_page,
        comm_sort_by: Object.keys(orderBy).map((i) => `${i}:${orderBy[i]}`)
      })
    },
    onColumnsReordered (nextColumns) {
      this.columns = nextColumns
    },
    onCheckAllItems (checked) {
      const items = []

      if (checked) {
        document
          .querySelectorAll('.checker')
          .forEach((checkbox) => items.push(Number(checkbox.value)))
      }

      this.checked = items
    },
    onCheckedRows (checked) {
      this.checked = checked
    },
    onEditColumnsClicked () {
      this.columnHeadersOpen({
        id: 1,
        headers: this.columns,
        name: 'All Contacts'
      })
    },
    onImportContactsClicked () {
      this.$refs.importContacts.open()
    },
    onFiltersClicked () {
      this.openFilters()
    },
    onLoadMore () {
      if (this.hasMore) {
        this.isLoadingMore = true
        const nextPage = this.allContacts.current_page + 1
        this.fetchContacts({
          page: nextPage,
          search_text: this.searchText
        })
          .then((data) => {
            this.contactsLoaded({
              id: this.$route.params.id,
              append: true,
              ...data
            })
          })
          .finally(() => {
            this.isLoadingMore = false
          })
      }
    },
    onFetchMyContacts (checked) {
      this.isLoading = true
      this.fetch({
        user_id: checked ? this.profile.id : undefined,
        search_text: this.searchText,
        page: this.allContacts.page
      })
    },
    onSearch (searchText) {
      this.isLoaded = false
      this.searchText = searchText
      this.fetch({ search_text: this.searchText })
    },
    fetch (params = {}) {
      this.isLoading = true
      Promise.all([this.fetchContacts(params), this.fetchContactsCount(params)])
        .then(([data, count]) => {
          this.contactsLoaded({
            id: this.$route.params.id,
            append: false,
            ...data,
            ...count
          })
        })
        .finally(() => {
          this.isLoading = false
          this.isLoaded = true
        })
        .catch((err) => {
          console.log(err)
        })
    },
    fetchContacts (params = {}) {
      const type = _.get(this.currentPinnedContactList, 'type', null)

      if (!type) {
        return []
      }

      if (type === ContactListTypes.STATIC) {
        return window.axios
          .get(`api/v1/contacts-list/${this.currentPinnedContactList.id}/items`)
          .then((response) => response.data)
      }

      if (type === ContactListTypes.DYNAMIC) {
        return window.axios
          .get('api/v1/contact', {
            params: createContactFilters(params)
          })
          .then((response) => response.data)
      }
    },
    fetchContactsCount (params) {
      return 0
    }
  },
  computed: {
    ...mapGetters('auth', ['profile']),
    ...mapGetters('contacts', ['allContacts', 'columnHeadersOpen', 'pinnedLists']),
    hasMore () {
      const hasNextPage = _.get(this.allContacts, 'next_page_url', null)
      return (
        hasNextPage && !this.isLoadingMore && !this.isLoading
      )
    },
    isLoadingDisabled () {
      return this.isLoading || !this.isLoaded
    },
    contactsListItems () {
      return _.get(this.allContacts, `${this.currentPinnedContactListId}.data`, [])
    },
    isEmpty () {
      const count = _.get(this.allContacts, `${this.currentPinnedContactListId}.data.length`, 0)
      return this.isLoaded && !count
    },
    totalContactsCount () {
      return _.get(this.pinnedLists, this.$route.params.id, []).length
    },
    currentPinnedContactListId () {
      return _.get(this.$route, 'params.id', null)
    },
    currentPinnedContactList () {
      let id = this.currentPinnedContactListId

      if (!id) {
        return {}
      }

      id = parseInt(id)
      const index = this.pinnedLists.findIndex(list => list.id === id)

      if (index === -1) {
        return {}
      }

      return _.get(this.pinnedLists, index, {})
    },
    currentPinnedContactListName () {
      return _.get(this.currentPinnedContactList, 'name', '')
    }
  },
  data () {
    return {
      moment,
      isLoading: false,
      isLoaded: false,
      isLoadingMore: false,
      myContacts: false,
      searchText: '',
      checked: [],
      columns: DEFAULT_COLUMNS,
      ContactListTypes
    }
  },
  watch: {
    currentPinnedContactList (newValue, oldValue) {
      this.fetch()
    }
  }
}
</script>
