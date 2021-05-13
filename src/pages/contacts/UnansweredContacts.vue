<template>
  <contacts-screen :loading="isLoadingDisabled">
    <template slot="title">
      <div class="pr-2">Unanswered</div>
      <span class="small text-muted"
        >{{ unanswered.total_contact_count }} contacts found</span
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
          v-for="(contact, index) in unanswered.data"
          :key="contact.id + index + Math.random()"
          :contact="contact"
          :columns="columns"
          :checked="checked"
          @checked="onCheckedRows"
        />
      </datatable>
    </template>

    <template slot="footer">
      <columns-config-modal ref="columnConfig" />
      <import-contacts-modal ref="importContacts" />
    </template>
  </contacts-screen>
</template>

<script>
import { createContactFilters } from './filters'
import { mapActions, mapGetters } from 'vuex'
import ColumnsConfigModal from 'src/pages/contacts/_components/columns-config-modal.vue'
import CompactBtn from 'src/components/buttons/compact-btn.vue'
import ContactsScreen from './_components/contacts-screen.vue'
import ContactsTableSearch from 'src/pages/contacts/_components/contacts-table-search.vue'
import Datatable from 'src/components/datatable/datatable.vue'
import ImportContactsModal from 'src/pages/contacts/_components/import-contacts-modal.vue'
import moment from 'moment'
import TableRow from 'src/pages/contacts/_components/table-row.vue'

export default {
  components: {
    ColumnsConfigModal,
    CompactBtn,
    ContactsScreen,
    ContactsTableSearch,
    Datatable,
    ImportContactsModal,
    TableRow
  },
  methods: {
    ...mapActions('contacts', ['openFilters', 'contactsLoaded']),
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
      this.$refs.columnConfig.open()
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
        const nextPage = this.unanswered.current_page + 1
        this.fetchContacts({
          page: nextPage,
          search_text: this.searchText
        })
          .then((data) => {
            this.contactsLoaded({ type: 'unanswered', append: true, ...data })
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
    onFetchMyContacts (checked) {
      this.isLoading = true
      this.fetch({
        user_id: checked ? this.profile.id : undefined,
        search_text: this.searchText,
        page: this.unanswered.page
      })
    },
    fetch (params = {}) {
      this.isLoading = true
      Promise.all([this.fetchContacts(params), this.fetchContactsCount(params)])
        .then(([data, count]) => {
          this.contactsLoaded({
            type: 'unanswered',
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
            has_unread: 1
          })
        })
        .then((response) => response.data)
    },
    fetchContactsCount () {
      return window.axios
        .get(
          'api/v1/contact/get-contacts-count?date_field=last_engagement_at&type=all&direction=all&report_type=date_v_campaign&chart_period=day&answer_status=all&export_type=json&min_talk_time=0&page=1&per_page=20&first_time_only=0&untagged_only=0&exclude_automated_communications=0&has_untagged_call=0&is_blocked=0&is_dnc=0&has_unread=0&is_new_lead=0&unassigned_leads=0&should_follow_the_sun=0&not_contacted=0&not_responded=0&responded=0&text_authorized=0&has_appointments=0&has_reminders=0&timezone=Asia%2FManila&contact_country=&contact_timezone=&changed=false&states_limit=%7B%22us%22:[],%22ca%22:[]%7D&initial_line_only=0&search_text=&search_fields[]=name&search_fields[]=phone_number&search_fields[]=email'
        )
        .then((response) => response.data)
    }
  },
  computed: {
    ...mapGetters('auth', ['profile']),
    ...mapGetters('contacts', ['unanswered']),
    hasMore () {
      return (
        this.unanswered.next_page_url && !this.isLoadingMore && !this.isLoading
      )
    },
    isLoadingDisabled () {
      return this.isLoading || !this.isLoaded
    },
    isEmpty () {
      return this.isLoaded && !this.unanswered.data.length
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
      columns: [
        {
          checkbox: true,
          draggable: false,
          sticky: true
        },
        {
          id: 1,
          label: 'Name',
          name: 'name',
          sortable: true,
          draggable: true,
          resizable: true,
          minWidth: 225
        },
        {
          id: 2,
          label: 'Phone Number',
          name: 'phone_number',
          sortable: true,
          draggable: true,
          resizable: true
        },
        {
          id: 3,
          label: 'Last Engagement',
          name: 'last_engagement_text',
          sortable: true,
          draggable: true,
          resizable: true
        },
        {
          id: 6,
          label: 'Tags',
          name: 'tags',
          sortable: false,
          draggable: true,
          resizable: true,
          minWidth: 200
        },
        {
          id: 7,
          label: 'Unreads',
          name: 'unread_count',
          sortable: true,
          draggable: true,
          resizable: false,
          maxWidth: 120,
          minWidth: 120
        },
        {
          id: 8,
          label: 'Actions',
          name: 'actions',
          sortable: false,
          draggable: false,
          resizable: false,
          maxWidth: 120,
          minWidth: 120
        }
      ]
    }
  },
  mounted () {
    this.fetch()
  }
}
</script>
