<template>
  <contacts-screen :loading="isLoadingDisabled">
    <template slot="title">
      <div class="pr-2">My Contacts</div>
      <span class="small text-muted"
        >{{ mycontacts.total_contact_count }} contacts found</span
      >
    </template>
    <template slot="actions">
      <div class="col-lg-6 px-0 mb-2 mb-lg-0 d-flex align-items-center">
        <contacts-table-search
          @search="onSearch"
          :disabled="isLoadingDisabled"
        ></contacts-table-search>
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
          v-for="(contact, index) in mycontacts.data"
          :key="contact.id + index + Math.random()"
          :contact="contact"
          :columns="columns"
          :checked="checked"
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
import columns from 'src/constants/columns'
import CompactBtn from 'src/components/buttons/compact-btn.vue'
import ContactsScreen from './_components/contacts-screen.vue'
import ContactsTableSearch from 'src/pages/contacts/_components/contacts-table-search.vue'
import Datatable from 'src/components/datatable/datatable.vue'
import ImportContactsModal from 'src/pages/contacts/_components/import-contacts-modal.vue'
import moment from 'moment'
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
    ...mapActions('contacts', ['openFilters', 'contactsLoaded', 'columnHeadersOpen']),
    onSortByField (nextSorts) {
      console.log(nextSorts)
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
        id: 2,
        headers: this.columns,
        name: 'My Contacts'
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
        const nextPage = this.mycontacts.current_page + 1
        this.fetchContacts({
          page: nextPage,
          search_text: this.searchText
        })
          .then((data) => {
            this.contactsLoaded({ type: 'mycontacts', append: true, ...data })
          })
          .finally(() => {
            this.isLoadingMore = false
          })
      }
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
            type: 'mycontacts',
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
          params: createContactFilters({
            ...params,
            user_id: this.profile.id
          })
        })
        .then((response) => response.data)
    },
    fetchContactsCount (params) {
      return window.axios
        .get('api/v1/contact/get-contacts-count', {
          params: createContactFilters({
            ...params,
            user_id: this.profile.id
          })
        })
        .then((response) => response.data)
    }
  },
  computed: {
    ...mapGetters('auth', ['profile']),
    ...mapGetters('contacts', ['mycontacts']),
    hasMore () {
      return (
        this.mycontacts.next_page_url && !this.isLoadingMore && !this.isLoading
      )
    },
    isLoadingDisabled () {
      return this.isLoading || !this.isLoaded
    },
    isEmpty () {
      return this.isLoaded && !this.mycontacts.data.length
    }
  },
  data () {
    return {
      moment,
      isLoading: false,
      isLoaded: false,
      isLoadingMore: false,
      searchText: '',
      checked: [],
      columns
    }
  },
  mounted () {
    this.fetch()
  }
}
</script>
