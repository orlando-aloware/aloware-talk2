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
        <contacts-table-search
          placeholder="Search All Contacts"
          :disabled="isLoadingDisabled"
          @search="onSearch"
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
          @clicked="onFiltersClicked"
        >
          Filters
          <b-badge class="ml-1 mt-1"
                   pill
                   variant="light text-muted">
            {{ filtersCount }}
          </b-badge>
        </compact-btn>
        <b-dropdown
          split
          split-variant="outline-primary"
          variant="primary"
          text="Save"
          class="m-2 b-compact-dropdown-button"
          size="sm"
          @click="onUpdateContactList"
        >
          <b-dropdown-item href="#"
                           @click="onCreateStaticList">
            Save as New Static List
          </b-dropdown-item>
          <b-dropdown-item href="#"
                           v-if="String(selectedList.type) === '2'"
                           @click="onCreateDynamicList">
            Save as New Dynamic List
          </b-dropdown-item>
        </b-dropdown>
        <compact-btn variant="secondary">Reset</compact-btn>

        <b-dropdown text="More"
                    variant="outline-primary"
                    class="m-2 b-compact-dropdown-button">
          <b-dropdown-item href="" v-on:click="onEditColumnsClicked"><i class="fa fa-bars"></i> Edit Columns</b-dropdown-item>
          <b-dropdown-item href=""
                           :disabled="!(list.type === ContactListType.STATIC && isEditable)"
                           v-on:click="onAddContactsToList">
            <i class="fa fa-list-ul"></i> Add Contacts to this List
          </b-dropdown-item>
          <b-dropdown-item href="#"><i class="fa fa-crosshairs"></i> Power Dialer</b-dropdown-item>
          <b-dropdown-item href="#"><i class="fa fa-file-csv"></i> Export as CSV</b-dropdown-item>
          <b-dropdown-item href="#"><i class="fa fa-trash-alt"></i> Delete</b-dropdown-item>
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
    <template slot="filters">
      <contacts-filters :listFilters="list.filters"
                        @filtersCount="updateFiltersCount"/>
    </template>
    <template slot="footer">
      <import-contacts-modal ref="importContacts" />
    </template>
  </contacts-screen>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import BulkActionMenu from 'pages/contacts/_components/bulk-action-menu'
import CompactBtn from 'src/components/buttons/compact-btn.vue'
import ContactsScreen from './_components/contacts-screen.vue'
import ContactsTableSearch from 'src/pages/contacts/_components/contacts-table-search.vue'
import Datatable from 'src/components/datatable/datatable.vue'
import ImportContactsModal from 'src/pages/contacts/_components/import-contacts-modal.vue'
import TableRow from 'src/pages/contacts/_components/table-row.vue'

import contactsMixins from './contacts.mixins'
import ContactsFilters from 'pages/contacts/_components/contacts-filters'

import { FROM_FILTERS } from 'src/constants/contacts-list-create-mode'

export default {
  components: {
    ContactsFilters,
    BulkActionMenu,
    CompactBtn,
    ContactsScreen,
    ContactsTableSearch,
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
      filtersCount: 0
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
      'createListOpen'
    ]),
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
    onEditColumnsClicked (e) {
      this.columnsOpen({
        id: this.id,
        headers: this.columns,
        name: this.list.name
      })

      e.preventDefault()
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
      return window.axios
        .put('/api/v2/contacts-list/' + this.selectedList.id, { filters: this.currentListFilters })
        .then(() => {
          this.$q.notify({
            message: 'Changes to contact list has been saved.',
            type: 'positive',
            textColor: 'white',
            actions: [
              {
                icon: 'close'
              }
            ]
          })
        })
        .catch((_err) => {
          this.$q.notify({
            message: 'Unable to update contact list.',
            type: 'negative',
            textColor: 'white',
            actions: [
              {
                icon: 'close'
              }
            ]
          })
        })
    },
    updateFiltersCount (count) {
      this.filtersCount = count
    },
    onAddContactsToList () {
      this.$router.push(`/contacts/list/${this.$route.params.id}/add`)
    }
  },
  computed: {
    ...mapGetters('auth', ['profile']),
    ...mapGetters('contacts', ['lists', 'listItems', 'selectedContacts', 'isFiltersOpen', 'selectedList', 'currentListFilters']),
    checked () {
      return this.selectedContacts[this.id] || []
    }
  }
}
</script>

<style lang="scss" scoped>
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
