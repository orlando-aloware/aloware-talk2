<template>
  <vue-bootstrap-typeahead :serializer="serializer"
                           :data="phoneNumbers"
                           v-model="phoneNumber"
                           class="width-214 important"
                           placeholder="Enter a name or phone number"
                           :minMatchingChars="3"
                           @hit="changePhoneNumber">
    <!-- htmlText is bound to the matched text derived from the serializer function -->
    <!-- data is bound to the matching array element in the data prop -->
    <template slot="suggestion" slot-scope="{ data }">
      <strong>{{ (data.first_name + ' ' + data.last_name).trim() }}</strong>
      <br>
      <span>{{ data.phone_number | fixPhone }}</span>
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
      phoneNumber: this.value,
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
      this.$emit('change', this.selectedPhoneNumber)
    }
  },

  watch: {
    value () {
      this.phoneNumber = this.value
    },

    phoneNumber: _.debounce(function () {
      if (this.phoneNumber.length >= 3) {
        this.getPhoneNumbers(this.phoneNumber)
      }
    }, 500)
  }
}
</script>
