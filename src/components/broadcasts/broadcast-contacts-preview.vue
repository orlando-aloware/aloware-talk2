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

    <div class="contacts-preview__header">
      Contacts Preview
      <span class="contacts-preview__header__counter">
        {{ contactsLength }} {{ contactsLength === 1 ? 'Contact' : 'Contacts' }}
      </span>
    </div>

    <datatable class="contacts-preview__body"
               :columns="columns"
               :is-scrollable="false"
               v-if="contacts.length">
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
              {{ contact.phone_number | fixPhone('NATIONAL', true) }}
            </td>

            <td :key="column.name"
                v-else-if="column.name === 'created_at'">
              {{ contact.created_at | fixFullDateTime }}
            </td>

            <td :key="column.name"
                v-else-if="column.name === 'tags'">
              <template v-if="Array.isArray(contact.tags) && contact.tags.length">
                <span>
                  <i class="fa fa-circle"
                     :style="`color: ${contact.tags[0].color};font-size:36%;position: relative; top: -3px;`" />
                  <span v-if="contact.tags.length > 1">
                    {{ contact.tags[0].name | truncate(17) }}
                  </span>
                  <span v-else>
                    {{ contact.tags[0].name | truncate(27) }}
                  </span>
                </span>
                <span class="ml-1 text-grey-7"
                      v-if="contact.tags.length > 1">
                  +{{ (contact.tags.length - 1) }} more
                </span>
              </template>
              <span v-else>-</span>
            </td>
          </template>
        </tr>
      </template>
    </datatable>
  </div>
</template>

<script>
import API from 'src/plugins/api/api'
import NameWrapper from 'src/components/name-wrapper.vue'
import Datatable from 'src/components/datatable.vue'
import { parseInt } from 'lodash'

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
        },
        {
          name: 'tags',
          relationName: 'tags',
          order: 3,
          minWidth: 200
        }
      ]
    },

    isValid () {
      return this.contactsLength > 0 && !this.loading
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
      order: 'desc'
    }
  }),

  created () {
    if (!this.list && !this.filters) {
      throw new Error('A list or filters are required to preview the contacts')
    }

    this.init()
  },

  methods: {
    init () {
      switch (true) {
        case this.list.type === 'contacts-list':
          this.setContactsListFilter()
          this.loadContacts()
          break
        case !!this.filters:
          this.setContactsFilters()
          this.loadContacts()
          break
        // FIXME: integrations
      }
    },

    loadContacts () {
      this.loading = true

      const cancelToken = window.axios.CancelToken
      const source = cancelToken.source()

      // load contacts based on filters
      const contactsPromise = API.V2.contacts.list(this.defaultFilters, source.token)
        .then(({ data }) => {
          this.contacts = data.data

          if (data.data.length) {
            this.$emit('contact-preview', data.data[0])
          }

          return Promise.resolve()
        })
        .catch(err => {
          this.$handleErrors(err.response)
        })

      // load count
      const countsPromise = API.V2.contacts.counts(this.defaultFilters)
        .then(({ data }) => {
          this.contactsLength = parseInt(data.count)

          return Promise.resolve()
        })
        .catch(err => {
          this.$handleErrors(err.response)
        })

      Promise.all([
        contactsPromise,
        countsPromise
      ])
        .then(() => {
          this.loading = false
        })
    },

    setContactsListFilter () {
      this.defaultFilters.list_id = this.list.id
    },

    setContactsFilters () {
      this.defaultFilters.filter_groups = this.filters
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
