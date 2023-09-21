<template>
  <div class="contacts-preview">
    <b-overlay class="h-100 w-100 position-absolute"
               rounded="sm"
               :show="true"
               v-show="loading">
      <template #overlay>
        <q-spinner-bars color="primary"
                        size="40px" />
      </template>
    </b-overlay>

    <div class="contacts-preview__header"
         v-if="!loading">
      Contacts Preview
      <span class="contacts-preview__header__counter">
        {{ contactsLength }} {{ contactsLength === 1 ? 'Contact' : 'Contacts' }}
      </span>
    </div>

    <datatable class="contacts-preview__body"
               use-empty-slot
               :is-empty="contacts.length === 0"
               :columns="columns"
               :use-full-height="false"
               v-if="!loading">
      <template slot="tbody">
        <tr class="datatable-row"
            :key="index"
            v-for="(contact, index) in contacts">
          <template v-for="column in columns">
            <td :key="column.name"
                v-if="column.name === 'name'">
              <name-wrapper link-path="/contacts/"
                            :resource="contact" />
            </td>

            <td :key="column.name"
                v-else-if="column.name === 'phone_number'">
              {{ contact.phone_number | fixPhone('NATIONAL', true, false, true) }}
            </td>

            <td :key="column.name"
                v-else-if="column.name === 'created_at'">
              {{ contact.created_at | fixFullDateTime }}
            </td>
          </template>
        </tr>
      </template>
      <template #empty
                v-if="contacts.length === 0">
        <div class="empty-state">
          <div class="h5">
            {{ noContactsPlaceholder }}
          </div>
        </div>
      </template>
    </datatable>
  </div>
</template>

<script>
import API from 'src/plugins/api/api'
import NameWrapper from 'src/components/name-wrapper.vue'
import Datatable from 'src/components/datatable.vue'
import { isEmpty, parseInt, debounce } from 'lodash'

export default {
  name: 'broadcast-contacts-preview',

  components: {
    NameWrapper,
    Datatable
  },

  props: {
    list: {
      type: Object,
      required: false,
      default: () => ({})
    },

    filters: {
      type: [Array, Object],
      required: false
    },

    integration: {
      type: Object,
      default: () => ({})
    }
  },

  computed: {
    columns () {
      return [
        {
          name: 'name',
          label: 'Name',
          order: 0,
          minWidth: 200
        },
        {
          name: 'phone_number',
          label: 'Phone Number',
          order: 1
        },
        {
          name: 'created_at',
          label: 'Date Added',
          order: 2,
          minWidth: 140
        }
      ]
    },

    isValid () {
      return this.contactsLength > 0 && !this.loading
    },

    noContactsPlaceholder () {
      switch (true) {
        case !isEmpty(this.list):
          return 'No contacts found on the current list'
        case !isEmpty(this.filters):
          return 'No contacts found based on the current filters'
        case !isEmpty(this.integration):
          return 'Contacts preview isn\'t available for integrations'
        default:
          return 'No contacts found'
      }
    },

    allFilters () {
      return {
        ...this.defaultFilters,
        ...this.currentFilters
      }
    }
  },

  data: () => ({
    loading: false,
    contacts: [],
    contactsLength: 0,
    defaultFilters: {
      page: 1,
      per_page: 25,
      sort: 'last_engagement_at',
      order: 'desc',
      filters: {
        dnc_option: {
          value: 5, // only contacts without dnc
          operator: 1 // is equal to
        }
      }
    },
    currentFilters: {}
  }),

  created () {
    if (!this.list && !this.filters) {
      throw new Error('A list or filters are required to preview the contacts')
    }

    this.init()
  },

  methods: {
    init: debounce(function () {
      this.currentFilters = {}

      switch (true) {
        case !isEmpty(this.list):
          this.setContactsListFilter()
          this.loadContacts()
          break
        case !isEmpty(this.filters):
          this.setContactsFilters()
          this.loadContacts()
          break
        case !isEmpty(this.integration) && this.integration.name === 'HubSpot':
          this.setIntegrationHubspot()
          break
      }
    }, 100),

    getContacts () {
      const cancelToken = window.axios.CancelToken
      const source = cancelToken.source()

      // load contacts based on filters
      return API.V2.contacts.list(this.allFilters, source.token)
        .then(({ data }) => {
          // only set contacts if it's not integration
          if (isEmpty(this.integration)) {
            this.contacts = data.data
          }

          if (data.data.length) {
            this.$emit('contact-preview', data.data[0])
          }

          return Promise.resolve()
        })
        .catch(err => {
          this.$handleErrors(err.response)
        })
    },

    getContactsCount () {
      return API.V2.contacts.counts(this.allFilters)
        .then(({ data }) => {
          this.contactsLength = parseInt(data.count)

          return Promise.resolve()
        })
        .catch(err => {
          this.$handleErrors(err.response)
        })
    },

    loadContacts () {
      this.loading = true

      // load contacts based on filters
      const contactsPromise = this.getContacts()

      // load count
      const countsPromise = this.getContactsCount()

      Promise.all([
        contactsPromise,
        countsPromise
      ])
        .then(() => {
          this.loading = false
        })
    },

    setContactsListFilter () {
      this.currentFilters.list_id = this.list.id
    },

    setContactsFilters () {
      this.currentFilters.filter_groups = this.filters
    },

    async setIntegrationHubspot () {
      this.loading = true

      this.contactsLength = this.integration.list.metaData.size

      // run this to get a preview contact
      await this.getContacts()

      this.loading = false
    }
  },

  watch: {
    list: {
      deep: true,
      handler () {
        this.init()
      }
    },

    filters: {
      deep: true,
      handler () {
        this.init()
      }
    },

    integration: {
      deep: true,
      handler () {
        this.init()
      }
    },

    isValid (state) {
      this.$emit('input', state)
    },

    contactsLength: {
      immediate: true,
      handler (count) {
        this.$emit('contacts-length', count)
      }
    }
  },

  beforeDestroy () {
    // force invalid state if component is destroyed
    this.$emit('input', false)
  }
}
</script>
