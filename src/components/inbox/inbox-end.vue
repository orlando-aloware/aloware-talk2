<template>
<div class="inbox-end mt-1 border-top-0 bg-transparent">
  <div class="inbox-info">
    <contact-details v-if="hasContact">
    </contact-details>
  </div>
</div>
</template>

<script>
import _ from 'lodash'
import ContactDetails from 'src/components/contacts/contact-details'
import { mapGetters } from 'vuex'

export default {
  name: 'inbox-end.vue',
  components: { ContactDetails },
  data () {
    return {
      showContactInfo: false
    }
  },
  computed: {
    ...mapGetters('contacts', ['contact']),
    hasContact () {
      return !_.isEmpty(this.contact)
    }
  },
  mounted () {
    this.$VueEvent.listen('toggle_contact_info', this.toggleContactInfo)
  },
  methods: {
    toggleContactInfo () {
      this.showContactInfo = !this.showContactInfo
    }
  }
}
</script>
