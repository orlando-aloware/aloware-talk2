<template>
  <vue-bootstrap-autocomplete :serializer="(item) => item.phone_number"
                              :screen-reader-text-serializer="(item) => this.getContactName(item)"
                              :data="phoneNumbers"
                              :minMatchingChars="3"
                              :showAllResults="true"
                              ref="searchField"
                              v-model="query"
                              class="important search-form contact-phone-number-search"
                              placeholder="Name or phone number"
                              @input="lookupPhoneNumber"
                              @hit="changePhoneNumber">
    <!-- htmlText is bound to the matched text derived from the serializer function -->
    <!-- data is bound to the matching array element in the data prop -->
    <template slot="suggestion" slot-scope="{ data }">
      <div class="contact-name">
        <span class="text-grey-100">{{ data.phone_number | fixPhone('INTERNATIONAL') }}</span>
      </div>
      <span class="text-xs">{{ getContactName(data) }}</span>
      <template v-if="data.company_name">
        <br>
        <span class="text-xs">{{ data.company_name }}</span>
      </template>
    </template>
  </vue-bootstrap-autocomplete>
</template>

<script>
import { debounce } from 'lodash'

export default {
  name: 'contact-phone-number-search',

  props: {
    value: {
      required: false
    },

    no_prepend: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  data () {
    return {
      query: this.value,
      phoneNumbers: [],
      selectedPhoneNumber: null
    }
  },

  computed: {
    prependText () {
      if (this.no_prepend) {
        return ''
      }

      return 'To:'
    }
  },

  mounted () {
    this.setupForm()
  },

  methods: {
    setupForm (noFocus = false) {
      this.query = this.value
      this.$refs.searchField.inputValue = this.query
      if (!noFocus) {
        this.focusInput()
      }
    },

    focusInput () {
      setTimeout(() => {
        if (this.$refs.searchField) {
          this.$refs.searchField.$refs.input.focus()
        }
      }, 100)
    },

    blurInput () {
      setTimeout(() => {
        if (this.$refs.searchField) {
          this.$refs.searchField.$refs.input.blur()
        }
      }, 100)
    },

    getPhoneNumbers (search) {
      if (!search) {
        this.phoneNumbers = []
        return
      }

      this.phoneNumbers = []
      this.$emit('searchResults', true)
      this.$axios.get('api/v2/contacts/quick-search', {
        params: {
          search: search
        }
      }).then((res) => {
        this.phoneNumbers = res.data.data
        this.$emit('searchResults', !!this.phoneNumbers.length)
      }).catch(err => {
        console.log(err)
        this.$handleErrors(err.response)
      })
    },

    changePhoneNumber ($event) {
      this.selectedPhoneNumber = $event.phone_number
      // this.$refs.searchField.inputValue = this.selectedPhoneNumber

      this.$emit('change', {
        currentNumber: this.selectedPhoneNumber,
        contactName: this.getContactName($event),
        companyName: $event.company_name,
        contactId: $event.contact_id,
        contactTimezone: $event.timezone
      })
      // this.blurInput()
    },

    getContactName (item) {
      if (!item.first_name || !item.last_name) {
        return 'No Name'
      }

      return (item.first_name + ' ' + item.last_name).trim()
    },

    lookupPhoneNumber: debounce(function (newVal) {
      if (this.selectedPhoneNumber && this.selectedPhoneNumber !== newVal) {
        this.changePhoneNumber({
          phone_number: this.query,
          contactName: '',
          company_name: null,
          contact_id: null,
          timezone: null
        })
      }
      this.getPhoneNumbers(this.query)
    }, 1000)
  },

  watch: {
    value () {
      this.setupForm(true)
    }
  }
}
</script>
