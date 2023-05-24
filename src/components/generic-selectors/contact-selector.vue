<template>
  <div :class="containerStyles"
       @click.prevent="onRedirectToContact">
    <vue-multiselect track-by="id"
                     label="name"
                     class="mr-1 chip__clear-blue shrink-options"
                     style="width: 100%;"
                     placeholder="Select contact"
                     :searchable="true"
                     :showNoResults="false"
                     :showNoOptions="false"
                     :close-on-select="true"
                     :options="options"
                     :show-labels="false"
                     :allow-empty="false"
                     :loading="forceLoading"
                     :disabled="disabled"
                     v-model="contact"
                     @select="onSelect"
                     @search-change="onSearch">
    </vue-multiselect>
    <q-tooltip v-if="redirectWhenDisabled">
      Click to go to contacts page
    </q-tooltip>
  </div>
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
    },

    redirectWhenDisabled: {
      type: Boolean,
      default: false
    },

    contactData: {
      type: Object,
      required: false
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
        'search': null,
        'sort': 'name',
        'order': 'desc'
      },
      forceLoading: false
    }
  },

  computed: {
    containerStyles () {
      return {
        'cursor-pointer': this.redirectWhenDisabled
      }
    }
  },

  async mounted () {
    // if component is disabled and the value is set, search for that specific contact only to fill as the option
    if (this.value && this.contactData) {
      this.options.push(this.formatContact(this.contactData))
      this.contact = this.options.find(contact => contact.id === this.value)

      this.$emit('loaded')
    }
  },

  methods: {
    onRedirectToContact () {
      if (!this.redirectWhenDisabled || !this.disabled || !this.value) {
        return
      }

      window.open(`/contacts/${this.value}`)
    },

    onSearch: _.debounce(function (query) {
      this.search = query
      this.options = []

      if (this.search.length >= this.threshold) {
        this.params.search = this.search

        this.loadContacts()
      }
    }, 500),

    onSelect (contact) {
      this.$emit('input', contact.id)
      this.$emit('change', contact)
    },

    formatContact (contact) {
      // Usually, the contact will have first and last name, and the logic is the same if just one is filled
      // But if any of these fields are not filled, the "name" attribute is used instead (comes from calendar event)
      // This happens when user dont have enough visibility, for instance
      const name = contact.first_name || contact.last_name
        ? `${contact.first_name || ''} ${contact.last_name || ''}`
        : (contact.name ? contact.name : 'No Name')

      return {
        id: contact.id,
        name: `${name} ${this.showNumber ? '(' + contact.phone_number + ')' : ''}`,
        timezone: contact.timezone
      }
    },

    async loadContacts () {
      this.forceLoading = true
      this.$emit('loading')

      const url = '/api/v2/contacts/quick-search'
      const response = await this.$axios.get(url, { params: this.params })
      const contacts = response.data.data

      contacts.forEach(contact => {
        // force contact_id to be the id, default is contact phone number
        contact.id = contact.contact_id

        this.options.push(this.formatContact(contact))
      })

      this.forceLoading = false
      this.$emit('loaded')
    }
  }
}
</script>
