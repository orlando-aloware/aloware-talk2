<template>
  <contacts-screen :loading="isLoadingDisabled">
    <template slot="title">
      <div class="d-flex flex-column">
        <div class="d-flex align-items-center">
          <router-link
            :to="'/contacts/list/' + $route.params.id"
            v-slot="{ href, navigate }"
          >
            <a
              class="btn btn-link p-0 text-muted pr-2"
              :href="href"
              @click="navigate"
            >
              <i class="fa fa-chevron-left"></i>
            </a>
          </router-link>
          Add contacts to
          <span class="title-icon"
            ><folder-static-icon height="20" width="20"
          /></span>
          {{ contactList.name }}
        </div>
        <div class="text-muted small action-desc">
          Manually select contacts or create a filter
        </div>
      </div>
    </template>

    <template slot="options">
      <div class="d-flex align-items-center">
        <div class="selected-contacts text-muted mr-2">
          {{ checked.length }} Selected Contact
        </div>
        <compact-btn
          :onClick="addSelectedContacts"
          :disabled="!checked.length"
          variant="primary"
          class="mr-2"
          >Add Selected Contacts</compact-btn
        >
        <compact-btn variant="outlined-light" :onClick="onCancel"
          >Cancel</compact-btn
        >
      </div>
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
        <div
          class="flex-grow-1 text-right pr-2 d-flex align-items-center justify-content-end"
        >
          <span class="small text-muted selected-contacts"
            >{{ totalCount }} Contacts</span
          >
        </div>
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
          v-for="(contact, index) in items"
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
import moment from 'moment'
import { mapActions, mapGetters } from 'vuex'
import CompactBtn from 'src/components/buttons/compact-btn.vue'
import ContactsScreen from './_components/contacts-screen.vue'
import ContactsTableSearch from 'src/pages/contacts/_components/contacts-table-search.vue'
import Datatable from 'src/components/datatable/datatable.vue'
import ImportContactsModal from 'src/pages/contacts/_components/import-contacts-modal.vue'
import FolderStaticIcon from 'src/components/icons/folder-static-icon.vue'
import TableRow from 'src/pages/contacts/_components/table-row.vue'

import {
  DEFAULT_CONTACT_LIST,
  DEFAULT_FILTERS
} from 'src/constants/contacts-list-types'

import isPlainObject from 'lodash/isPlainObject'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'

export default {
  components: {
    CompactBtn,
    ContactsScreen,
    ContactsTableSearch,
    Datatable,
    ImportContactsModal,
    TableRow,
    FolderStaticIcon
  },
  props: {
    contactList: {
      type: Object,
      required: true
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
      id: 'static'
    }
  },
  computed: {
    ...mapGetters('auth', ['profile']),
    ...mapGetters('contacts', ['lists', 'listItems']),
    items () {
      if (this.listItems[this.id]) {
        return this.listItems[this.id].data
      }
      return []
    },
    totalCount () {
      if (!this.listItems[this.id]) return 0
      return this.listItems[this.id].total_contact_count
    },
    currentPage () {
      if (!this.listItems[this.id]) return 1
      return this.listItems[this.id].current_page
    },
    hasMore () {
      return (
        this.listItems[this.id] &&
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
        console.log(err)
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
        console.log(err)
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
        contact_list_id: this.$route.params.id
          ? this.$route.params.id
          : undefined
      }
    }
  },
  methods: {
    ...mapActions('contacts', [
      'columnsOpen',
      'openFilters',
      'contactsLoaded',
      'columnsReordered'
    ]),
    addSelectedContacts () {
      this.isLoading = true
      return window.axios
        .post('api/v1/contact-list-items', {
          contact_list_id: this.contactList.id,
          contacts: this.getSelectedContacts()
        })
        .then(() => {
          this.$router.resolve('/contacts/list/' + this.contactList.id)
        })
        .catch((err) => {
          const { message, html } = extractErrorMessage(err)
          this.$q.notify({
            message,
            type: 'negative',
            textColor: 'white',
            html
          })
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    getSelectedContacts () {
      return this.listItems[this.id].data.filter((i) =>
        this.checked.includes(i.id)
      )
    },
    onCancel () {
      this.$router.push('/contacts/list/' + this.contactList.id)
    },
    onSortByField (sorts) {
      this.isLoaded = false
      this.fetch({
        search_text: this.searchText,
        page: this.currentPage,
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
  mounted () {
    this.fetch()
  },
  watch: {
    '$route.params.id': function () {
      this.fetch(this.id)
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
@import 'src/css/breakpoints.scss';

.title-icon {
  padding-left: 5px;
  padding-right: 5px;
  svg {
    path {
      stroke: $dark;
    }
  }
}

.selected-contacts {
  font-size: 11px;
}

.action-desc {
  padding-left: 20px;
}
</style>
