<template>
<div class="inbox-end mx-3 mt-3 border-top-0 bg-transparent">
  <div class="inbox-info">
    <contact-details v-if="selectedContactId">
    </contact-details>
  </div>
</div>
</template>

<script>
import ContactDetails from 'src/components/contacts/contact-details'
import { mapState } from 'vuex'

export default {
  name: 'inbox-end.vue',
  components: { ContactDetails },
  data () {
    return {
      showContactInfo: false
    }
  },
  computed: {
    ...mapState('inbox', ['selectedContactId'])
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

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
@import 'src/css/breakpoints.scss';
</style>
