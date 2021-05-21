<template>
  <contacts-screen :loading="isLoadingDisabled">
    <template slot="title">
      <div class="pr-2">{{ name }}</div>
      <span class="small text-muted"
        >{{ listItems[id].total_contact_count }} contacts found</span
      >
    </template>
    <template slot="actions">
      <div class="col-lg-6 px-0 mb-2 mb-lg-0 d-flex align-items-center">
        <contacts-table-search
          @search="onSearch"
          :disabled="isLoadingDisabled"
        ></contacts-table-search>
        <div class="px-3" v-if="!isMyContactsView">
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
          v-for="(contact, index) in listItems[id].data"
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
import { mapActions, mapGetters } from 'vuex'
import CompactBtn from 'src/components/buttons/compact-btn.vue'
import ContactsScreen from './_components/contacts-screen.vue'
import ContactsTableSearch from 'src/pages/contacts/_components/contacts-table-search.vue'
import Datatable from 'src/components/datatable/datatable.vue'
import ImportContactsModal from 'src/pages/contacts/_components/import-contacts-modal.vue'
import moment from 'moment'
import TableRow from 'src/pages/contacts/_components/table-row.vue'
import {
  DEFAULT_CONTACT_LIST,
  DEFAULT_FILTERS
} from 'src/constants/contacts-list-types'
import isPlainObject from 'lodash/isPlainObject'

export default {
  components: {
    CompactBtn,
    ContactsScreen,
    ContactsTableSearch,
    Datatable,
    ImportContactsModal,
    TableRow
  },
  props: {
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  methods: {
    ...mapActions('contacts', [
      'columnsOpen',
      'openFilters',
      'contactsLoaded',
      'columnsReordered'
    ]),
    onSortByField (sorts) {
      this.isLoaded = false
      this.fetch({
        search_text: this.searchText,
        page: this.listItems[this.id].current_page,
        comm_sort_by: `${sorts.orderBy}:${sorts.order}`
      })
    },
    onColumnsReordered (nextColumns) {
      this.columnsReordered({
        id: this.id,
        headers: nextColumns
      })
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
      this.columnsOpen({
        id: this.id,
        headers: this.columns,
        name: this.name
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
        const nextPage = this.listItems[this.id].current_page + 1
        this.fetchContacts({
          page: nextPage,
          search_text: this.searchText
        })
          .then((data) => {
            this.contactsLoaded({ id: this.id, append: true, ...data })
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
        page: this.listItems[this.id].page
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
            id: this.id,
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
      return window.axios
        .get('api/v1/contact', {
          params: this.createContactFilters(params)
        })
        .then((response) => response.data)
    },
    fetchContactsCount (params) {
      return window.axios
        .get('api/v1/contact/get-contacts-count', {
          params: this.createContactFilters(params)
        })
        .then((response) => response.data)
    },
    createContactFilters (params) {
      return Object.assign(this.filters, params)
    }
  },
  computed: {
    ...mapGetters('auth', ['profile']),
    ...mapGetters('contacts', ['lists', 'listItems']),
    hasMore () {
      return (
        this.listItems[this.id].next_page_url &&
        !this.isLoadingMore &&
        !this.isLoading
      )
    },
    isLoadingDisabled () {
      return this.isLoading || !this.isLoaded
    },
    isEmpty () {
      return this.isLoaded && !this.listItems[this.id].data.length
    },
    isMyContactsView () {
      return DEFAULT_CONTACT_LIST.MY_CONTACTS.id === this.id
    },
    columns () {
      try {
        let headers = []
        if (this.lists[this.id] && this.lists[this.id].headers) {
          headers = this.lists[this.id].headers
          if (typeof headers === 'string') {
            headers = JSON.parse(headers)
          }
        }

        if (!Array.isArray(headers)) {
          throw new Error('Headers field is broken')
        }

        return headers
      } catch (err) {
        console.error(err)
        return []
      }
    },
    listFilters () {
      try {
        let filters = {}
        if (this.lists[this.id] && this.lists[this.id].filters) {
          filters = this.lists[this.id].filters
          if (typeof filters === 'string') {
            filters = JSON.parse(filters)
          }
        }

        if (!isPlainObject(filters)) {
          throw new Error('Filters field is broken')
        }

        return filters
      } catch (err) {
        console.error(err)
        return {}
      }
    },
    filters () {
      return {
        ...DEFAULT_FILTERS,
        ...this.listFilters,
        user_id:
          this.myContacts || this.id === DEFAULT_CONTACT_LIST.ALL_CONTACTS.id
            ? this.profile.id
            : undefined,
        contact_list_id: this.$route.params.id ? this.$route.params.id : undefined
      }
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
      checked: []
    }
  },
  mounted () {
    this.fetch()
  },
  watch: {
    '$route.params.id': function (id) {
      this.fetch(id)
    }
  }
}
</script>
