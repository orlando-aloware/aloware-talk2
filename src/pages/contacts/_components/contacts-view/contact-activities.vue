<template>
  <div class="">
    <contact-activity v-for="(communication, index) in communications"
              :key="communication.id + '-comm-' + index"
              :ref="(communication.type !== undefined ? 'communication-' : 'contact-audit-') + communication.id"
              :communication="communication"
              :contact="contact">
    </contact-activity>
  </div>
</template>

<script>
import ContactActivity from 'pages/contacts/_components/contacts-view/contact-activity'
import { mapGetters } from 'vuex'
export default {
  name: 'contact-activities',
  props: {
    communications: {
      required: true,
      type: Array,
      default: () => []
    }
  },
  computed: {
    ...mapGetters('contacts', [ 'contact' ])
  },
  components: {
    ContactActivity
  }
}
</script>

<style scoped>

</style>
