<template>
  <vue-multiselect track-by="id"
                   label="name"
                   class="mr-1 chip__clear-blue shrink-options"
                   style="width: 100%"
                   placeholder="Select contact"
                   :searchable="true"
                   :showNoResults="false"
                   :showNoOptions="false"
                   :close-on-select="true"
                   :options="options"
                   :show-labels="false"
                   :allow-empty="false"
                   :disabled="disabled"
                   :loading="forceLoading"
                   v-model="contact"
                   @select="onSelect"
                   @search-change="onSearch">
  </vue-multiselect>
</template>

<script>
import _ from 'lodash'
import VueMultiselect from 'vue-multiselect'

export default {
  name: 'contact-selector',

  components: {
    VueMultiselect
  },

  props: {
    value: {
      type: Number,
      required: false
    },

    disabled: {
      type: Boolean,
      default: false
    },

    threshold: {
      type: Number,
      default: 3
    },

    showNumber: {
      type: Boolean,
      default: true
    }
  },

  data () {
    return {
      contact: null,
      search: '',
      options: [],
      params: {
        'page': 1,
        'per_page': 25,
        'filter_groups[0][filters][search][value]': '',
        'filter_groups[0][is_conjunction]': true,
        'sort': 'last_engagement_at',
        'order': 'desc'
      },
      forceLoading: false
    }
  },

  async mounted () {
    // if component is disabled and the value is set, search for that specific contact only to fill as the option
    if (this.value) {
      await this.loadContacts(this.value)

      this.contact = this.options.find(contact => contact.id === this.value)
    }
  },

  methods: {
    onSearch: _.debounce(function (query) {
      this.search = query
      this.options = []

      if (this.search.length >= this.threshold) {
        this.params['filter_groups[0][filters][search][value]'] = this.search

        this.loadContacts()
      }
    }, 500),

    onSelect (contact) {
      this.$emit('input', contact.id)
    },

    formatContact (contact) {
      const name = contact.first_name || contact.last_name
        ? contact.first_name + ' ' + contact.last_name
        : 'No Name'

      return {
        id: contact.id,
        name: `${name} ${this.showNumber ? ' (' + contact.phone_number + ')' : ''}`
      }
    },

    async loadContacts (id = null) {
      this.forceLoading = true
      this.$emit('loading')

      const url = '/api/v2/contacts' + (id ? '/' + id : '')
      const response = await this.$axios.get(url, { params: this.params })

      if (id) {
        this.options.push(this.formatContact(response.data))
      } else {
        const contacts = response.data.data

        contacts.forEach(contact => {
          this.options.push(this.formatContact(contact))
        })
      }

      this.forceLoading = false
      this.$emit('loaded')
    }
  }
}
</script>
