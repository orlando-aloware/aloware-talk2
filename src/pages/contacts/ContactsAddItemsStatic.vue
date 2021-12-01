<template>
  <contacts-screen :loading="isLoadingDisabled">
    <template slot="title">
      <div class="d-flex flex-column">
        <div class="d-flex align-items-center">
          <router-link
            :to="`${urlRoutePath}${$route.params.id}`"
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
          <span v-if="!openEdit">Add contacts to</span>
          <div
            v-if="!openEdit"
            class="text-grey-90">
            <span class="title-icon">
              <folder-static-icon/>
            </span>
            {{ contactList.name }}
          </div>
          <TextPopover
            v-else
            v-model="contactList.name"
            :id="contactList.id" />
        </div>
        <div class="text-muted small action-desc">
          {{ openEdit ? 'Add contacts by creating a filter or manually selecting' : 'Manually select contacts or create a filter'}}
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
          class="mr-2"
          variant="primary"
          :disabled="!checked.length"
          @clicked="addSelectedContacts"
        >
          Add Selected Contacts
        </compact-btn>
        <compact-btn variant="outlined-light"
                     @clicked="onCancel"
        >
          Cancel
        </compact-btn
        >
      </div>
    </template>
    <template slot="actions">
      <div class="col-lg-6 px-0 mb-2 mb-lg-0 d-flex align-items-center">
        <search
          placeholder="Search All Contacts"
          @search="onSearch"
          :disabled="isLoadingDisabled"
        ></search>
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
        <div class="flex-grow-1 text-right pr-2 d-flex align-items-center justify-content-end">
          <span class="small text-muted selected-contacts mr-2">{{ totalCount }} Contacts</span>

          <div class="v-divider">
          </div>
          <div :class="['btn-filter-wrapper mr-2', hasAppliedFilters ? 'background' : '' ]">
            <compact-btn
              borderless
              variant="outlined-light"
              customClass="pr-0 pl-0 fs-14 _500 position-relative primary not-focusable"
              @clicked="onFiltersClicked"
            >
              <b-badge v-if="hasAppliedFilters"
                       class="ml-2 mt-1"
                       pill
                       variant="primary">
                {{ filtersCount }}
              </b-badge>
              <span class="pl-2  pr-2">Filters</span>

            </compact-btn>
            <compact-btn
              borderless
              customClass="mr-2 pr-0 pl-0 fs-14 _500 position-relative primary not-focusable"
              variant="outlined-light"
              v-if="hasAppliedFilters"
              :disabled="!hasAppliedFilters"
              @clicked="resetFilters">
              <i class="fa fa-times"></i>
            </compact-btn>
          </div>
        </div>
      </div>
    </template>

    <template slot="table">
      <datatable
        scroll-area-class="static-list-add-item"
        :stickyHeaders="true"
        :columns="validColumns"
        :hasMore="hasMore"
        :isEmpty="isEmpty"
        :isLoadingMore="isLoadingMore"
        @reordered="onColumnsReordered"
        @checked="onCheckAllItems"
        @sort="onSortByField"
        @more="onLoadMore"
      >
        <template slot="tbody">
          <table-row
            v-for="(contact, index) in items"
            :key="contact.id + index + Math.random()"
            :contact="contact"
            :columns="validColumns"
            :checked="checked"
            :contactListId="1"
            @checked="onCheckedRows"
          />
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
import CompactBtn from 'src/components/compact-btn.vue'
import ContactsScreen from 'src/components/contacts/contacts-screen.vue'
import Search from 'src/components/search.vue'
import Datatable from 'src/components/datatable.vue'
import ImportContactsModal from 'src/components/import-contacts-modal.vue'
import FolderStaticIcon from 'src/components/icons/folder-static-icon.vue'
import TableRow from 'src/components/table-row.vue'
import TextPopover from 'components/popover/text-popover'

import extractErrorMessage from 'src/plugins/helpers/extract-error-message'
import contactsMixins from 'src/plugins/mixins/contacts.mixin'
import ContactsFilters from 'components/contacts/contacts-filters'

export default {
  mixins: [contactsMixins],
  components: {
    ContactsFilters,
    CompactBtn,
    ContactsScreen,
    Search,
    Datatable,
    ImportContactsModal,
    TableRow,
    TextPopover,
    FolderStaticIcon
  },
  props: {
    contactList: {
      type: Object,
      required: true
    },
    isContactModule: {
      type: Boolean,
      default: true
    },
    openEdit: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      checked: [],
      id: 'all',
      filterHasChanges: false
    }
  },
  computed: {
    ...mapGetters('auth', ['profile']),
    ...mapGetters('contacts', ['lists', 'listItems', 'isFiltersOpen']),
    items () {
      if (this.listItems[this.id]) {
        return this.listItems[this.id].data
      }
      return []
    },
    totalCount () {
      if (this.listItems[this.id]) {
        return this.listItems[this.id].total
      }
      return 0
    },
    currentPage () {
      if (this.listItems[this.id]) {
        return this.listItems[this.id].current_page
      }
      return 1
    },
    hasAppliedFilters () {
      return this.filtersCount > 0
    },
    isResetDisabled () {
      return !this.filterHasChanges
    },
    validColumns () {
      return this.columns.filter(column => column.label !== 'Actions')
    },
    urlRoutePath () {
      if (this.isContactModule) {
        return '/contacts/list/'
      }
      return '/power-dialer/list/'
    }
  },
  methods: {
    ...mapActions('contacts', [
      'columnsOpen',
      'openFilters',
      'closeFilters',
      'contactsLoaded',
      'columnsReordered',
      'setShouldUpdateSelectedListContactCount'
    ]),
    addSelectedContacts () {
      this.isLoading = true
      this.closeFilters()
      return this.$axios
        .post('api/v2/contact-list-items', {
          contact_list_id: this.contactList.id,
          contacts: this.checked
        })
        .then(() => {
          this.setShouldUpdateSelectedListContactCount(true)
          this.$router.push(`${this.urlRoutePath}${this.contactList.id}`)
          this.$generalNotification('Selected contacts were successfully added')
        })
        .catch((err) => {
          const { message, html } = extractErrorMessage(err)
          console.log(html)
          this.$generalNotification(message, 'error')
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
      this.closeFilters()
      this.$router.push(`${this.urlRoutePath}${this.contactList.id}`)
    },
    onColumnsReordered (nextColumns) {
      this.columnsReordered({
        id: this.id,
        headers: nextColumns
      })
    },
    onCheckAllItems (checked) {
      let _this = this
      document
        .querySelectorAll('.checker')
        .forEach(function (checkbox) {
          if (checked) {
            _this.checked.push(_this.listItems['all'].data.find(item => item.id === Number(checkbox.value)))
          } else {
            _this.checked = _this.checked.filter(item => item.id !== Number(checkbox.value))
          }
        })
    },
    onCheckedRows (checked) {
      this.checked = checked
    },
    onFiltersClicked () {
      if (this.isFiltersOpen) {
        this.closeFilters()
      } else {
        this.openFilters()
      }
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
    hasFilterChanges () {
      return JSON.stringify(this.initialListFilters) !== JSON.stringify(this.currentListFilters)
    },
    updateFilterHasChanges () {
      this.filterHasChanges = this.hasFilterChanges()
    },
    updateFiltersCount (count) {
      this.filtersCount = count
    }
  },
  mounted () {
    this.fetch()
    console.log('Add items are triggered')
  },
  watch: {
    '$route.params.id': function () {
      this.fetch()
    },
    currentListFilters: {
      deep: true,
      handler: function () {
        this.fetch(this.currentListFilters)
      }
    }
  }
}
</script>
