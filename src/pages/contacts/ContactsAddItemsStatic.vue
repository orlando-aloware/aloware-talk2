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
        <contacts-table-search
          placeholder="Search All Contacts"
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
        <template slot="tbody">
          <table-row
            v-for="(contact, index) in items"
            :key="contact.id + index + Math.random()"
            :contact="contact"
            :columns="columns"
            :checked="checked"
            :contactListId="1"
            @checked="onCheckedRows"
          />
        </template>
      </datatable>
    </template>

    <template slot="footer">
      <import-contacts-modal ref="importContacts" />
    </template>
  </contacts-screen>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import CompactBtn from 'components/compact-btn.vue'
import ContactsScreen from 'components/contacts/contacts-screen.vue'
import ContactsTableSearch from 'components/contacts/contacts-table-search.vue'
import Datatable from 'components/datatable.vue'
import ImportContactsModal from 'components/import-contacts-modal.vue'
import FolderStaticIcon from 'src/components/icons/folder-static-icon.vue'
import TableRow from 'components/table-row.vue'

import extractErrorMessage from 'src/plugins/helpers/extract-error-message'
import contactsMixins from 'src/plugins/mixins/contacts.mixin'

export default {
  mixins: [contactsMixins],
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
      checked: [],
      id: 'all'
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
        .post('api/v2/contact-list-items', {
          contact_list_id: this.contactList.id,
          contacts: this.getSelectedContacts()
        })
        .then(() => {
          this.$router.push('/contacts/list/' + this.contactList.id)
          this.$q.notify({
            message: 'Selected contacts were successfully added',
            type: 'positive',
            textColor: 'white'
          })
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
    }
  },
  mounted () {
    this.fetch()
  },
  watch: {
    '$route.params.id': function () {
      this.fetch()
    }
  },
  currentListFilters: {
    deep: true,
    handler: function () {
      this.fetch(this.currentListFilters)
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
