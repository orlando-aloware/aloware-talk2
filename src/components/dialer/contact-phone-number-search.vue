<template>
  <vue-bootstrap-typeahead :serializer="serializer"
                           :data="phoneNumbers"
                           :minMatchingChars="3"
                           ref="searchField"
                           v-model="query"
                           class="width-214 important search-form"
                           placeholder="Enter a name or phone number"
                           @hit="changePhoneNumber">
    <!-- htmlText is bound to the matched text derived from the serializer function -->
    <!-- data is bound to the matching array element in the data prop -->
    <template slot="suggestion" slot-scope="{ data }">
      <span class="text-grey-100">{{ data.phone_number | fixPhone('INTERNATIONAL') }}</span>
      <br>
      <span class="text-xs">{{ getContactName(data) }}</span>
      <template v-if="data.company_name">
        <br>
        <span class="text-xs">{{ data.company_name }}</span>
      </template>
    </template>
  </vue-bootstrap-typeahead>
</template>

<script>
import _ from 'lodash'

export default {
  name: 'contact-phone-number-search',

  props: {
    value: {
      required: false
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
    serializer (item) {
      return item => {
        let name = (item.first_name + ' ' + item.last_name).trim()
        if (!name.length) {
          name = 'No Name'
        }

        let searchTerm = name + ' - ' + item.phone_number
        return searchTerm
      }
    }
  },

  methods: {
    getPhoneNumbers (search) {
      this.phoneNumbers = []
      window.axios.get('api/v2/contacts/quick-search', {
        params: {
          search: search
        }
      }).then((res) => {
        this.phoneNumbers = res.data.data
      })
    },

    changePhoneNumber ($event) {
      this.selectedPhoneNumber = $event.phone_number
      this.$refs.searchField.inputValue = this.selectedPhoneNumber
      this.$emit('change', this.selectedPhoneNumber)
    },

    getContactName (item) {
      let name = (item.first_name + ' ' + item.last_name).trim()
      if (!name.length) {
        name = 'No Name'
      }

      return name
    }
  },

  watch: {
    value () {
      this.query = this.value
    },

    query: _.debounce(function () {
      this.$emit('change', this.query)
      if (this.query.length >= 3) {
        this.getPhoneNumbers(this.query)
      }
    }, 500)
  }
}
</script>
