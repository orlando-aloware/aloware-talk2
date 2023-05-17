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
      <span class="contacts-preview__header__counter"
            v-if="contactsLength > 0">
        {{ contactsLength }} {{ contactsLength > 1 ? 'Contacts' : 'Contact' }}
      </span>
    </div>

    <datatable :columns="columns"
               :is-scrollable="false">
      <template slot="tbody">
        <tr class="datatable-row"
            :key="contact.name"
            v-for="contact in contacts">
          <template v-for="column in columns">
            <td :key="column.name"
                v-if="column.name === 'name'">
              <name-wrapper link-path="/contacts/"
                            :resource="contact" />
            </td>

            <td :key="column.name"
                v-else-if="column.name === 'phone_number'">
              {{ contact.phone_number }}
            </td>

            <td :key="column.name"
                v-else-if="column.name === 'created_at'">
              {{ contact.created_at }}
            </td>

            <td :key="column.name"
                v-else-if="column.name === 'action'">
              {{ contact.tags }}
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
import { set } from 'lodash'

export default {
  name: 'broadcast-contacts-preview',

  components: {
    NameWrapper,
    Datatable
  },

  props: {
    list: {
      type: Object,
      required: false
    },

    filters: {
      type: Object,
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
        // FIXME: integrations
        // FIXME: filters
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

          return Promise.resolve()
        })
        .catch(err => {
          this.$handleErrors(err.response)
        })

      // load count
      const countsPromise = API.V2.contacts.counts(this.defaultFilters)
        .then(({ data }) => {
          this.contactsLength = data.count

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
      set(this.defaultFilters, 'filter_groups[0][is_conjunction]', true)
      set(this.defaultFilters, 'filter_groups[0].filters.contact_lists[0].value[0]', this.list.id)
      set(this.defaultFilters, 'filter_groups[0].filters.contact_lists[0].operator', 1) // FIXME: use a constant
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
    }
  }
}
</script>
