<template>
  <contacts-screen :loading="isLoadingDisabled">
    <template slot="title">
      <div class="d-flex flex-column">
        <div class="pr-2">{{ list.name }}</div>
        <div class="small text-muted">
          {{ listItems[id].total }} contacts found
        </div>
      </div>
    </template>
    <template slot="options">
      <router-link
        v-if="list.type === ContactListType.STATIC && isEditable"
        v-slot="{ navigate }"
        :to="'/contacts/list/' + $route.params.id + '/add'"
      >
        <compact-btn variant="primary" :onClick="navigate">
          <i class="fa fa-plus mr-2"></i> Add Contacts
        </compact-btn>
      </router-link>

      <compact-btn
        variant="primary"
        v-if="list.type === ContactListType.DYNAMIC && isEditable"
        :onClick="onFiltersClicked"
      >
        <i class="fa fa-plus mr-2"></i> Add Filters
      </compact-btn>
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
          <i class="fa fa-list mr-2"></i> Manage Filters
        </compact-btn>
        <compact-btn
          variant="outlined-light"
          customClass="mr-2"
          :onClick="onEditColumnsClicked"
        >
          <i class="fa fa-cog text-success mr-1"></i> Edit Columns
        </compact-btn>
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
        @reordered="onColumnsReordered"
        @checked="onCheckAllItems"
        @sort="onSortByField"
        @more="onLoadMore"
      >
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

    <template slot="footer">
      <import-contacts-modal ref="importContacts" />
    </template>
  </contacts-screen>
</template>

<script>
import qs from 'qs'
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
  DYNAMIC,
  OPERATORS,
  STATIC
} from 'src/constants/contacts-list-types'
import isPlainObject from 'lodash/isPlainObject'
import BulkActionMenu from 'pages/contacts/_components/bulk-action-menu'

export default {
  components: {
    BulkActionMenu,
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
      ContactListType: { STATIC, DYNAMIC }
    }
  },
  methods: {
    ...mapActions('contacts', [
      'columnsOpen',
      'openFilters',
      'contactsLoaded',
      'columnsReordered',
      'setListSelectedContacts',
      'setSelectedList'
    ]),
    onSortByField (sorts) {
      this.isLoaded = false
      this.fetch({
        search: this.searchText,
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
      this.setListSelectedContacts({ id: this.id, contacts: items })
    },
    onCheckedRows (checked) {
      this.setListSelectedContacts({ id: this.id, contacts: checked })
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
          search: this.searchText
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
        contact_owner: checked ? this.profile.id : undefined,
        search: this.searchText,
        page: this.listItems[this.id].page
      })
    },
    onSearch (searchText) {
      this.isLoaded = false
      this.searchText = searchText
      this.fetch({ search: this.searchText })
    },
    fetch (params = {}) {
      this.isLoading = true
      window.axios
        .get('api/v2/contacts', {
          params: this.buildQueryString(params),
          paramsSerializer: qs.stringify
        })
        .then((response) => response.data)
        .then((data) => {
          this.contactsLoaded({
            id: this.id,
            append: false,
            ...data
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
    buildQueryString (params) {
      const invalidIds = this.commonIds

      const query = {
        page: 1
      }

      query.filters = { ...this.listFilters }

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
  },
  computed: {
    ...mapGetters('auth', ['profile']),
    ...mapGetters('contacts', ['lists', 'listItems', 'selectedContacts']),
    checked () {
      return this.selectedContacts[this.id] || []
    },
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
    isStartState () {
      return this.$route.query.start
    },
    isEmpty () {
      return this.isLoaded && !this.listItems[this.id].data.length
    },
    isMyContactsView () {
      return DEFAULT_CONTACT_LIST.MY_CONTACTS.id === this.id
    },
    isEditable () {
      return !this.commonIds.includes(this.list.id)
    },
    commonIds () {
      return Object.keys(DEFAULT_CONTACT_LIST).map(
        (k) => DEFAULT_CONTACT_LIST[k].id
      )
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
    list () {
      if (!this.$route.params.id) {
        return this.lists['all']
      }
      return this.lists[this.$route.params.id]
    }
  },
  mounted () {
    this.setSelectedList({ id: this.id, name: this.name, type: this.type })
    this.fetch()
  },
  watch: {
    '$route.params.id': function (id) {
      this.setSelectedList({ id, name: this.name, type: this.type })
      this.fetch({ contact_list_id: id })
    }
  }
}
</script>

<style lang="scss">
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
@import 'src/css/breakpoints.scss';

.start-state {
  align-items: center;
  background: $white;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: flex-start;
  left: 0;
  padding-top: 36px;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 0;
}
</style>
