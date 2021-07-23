<template>
  <vue-bootstrap-typeahead v-model="phoneNumber"
                           class="width-214 important"
                           placeholder="Enter a phone number"
                           :data="['4243942058', '8189005934', '8183148509']">
    <!-- htmlText is bound to the matched text derived from the serializer function -->
    <!-- data is bound to the matching array element in the data prop -->
    <template slot="suggestion" slot-scope="{ data, htmlText }">
      <strong>Sohrab Cell</strong>
      <br>
      <span v-html="htmlText"></span>
    </template>
  </vue-bootstrap-typeahead>
</template>

<script>
export default {
  name: 'contact-phone-number-search',

  props: {
    value: {
      required: false
    }
  },

  data () {
    return {
      phoneNumber: this.value
    }
  },

  watch: {
    value () {
      this.phoneNumber = this.value
    },

    phoneNumber (val) {
      if (this.value !== undefined && this.phoneNumber !== this.value) {
        this.$emit('change', val)
      }
    }
  }
}
</script>
