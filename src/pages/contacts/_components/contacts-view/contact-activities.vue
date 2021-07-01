<template>
  <div>
    <div class="contact-activities-wrapper">
      <contact-activity v-for="(communication, index) in communications"
                        :key="communication.id + '-comm-' + index"
                        :ref="(communication.type !== undefined ? 'communication-' : 'contact-audit-') + communication.id"
                        :communication="communication"
                        :contact="contact">
      </contact-activity>
    </div>
    <message-composer></message-composer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ContactActivity from 'pages/contacts/_components/contacts-view/contact-activity'
import MessageComposer from 'pages/contacts/_components/message-composer/message-composer'

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
    MessageComposer,
    ContactActivity
  }
}
</script>

<style lang="scss" scoped>
 .contact-activities-wrapper {
   height: calc(100% - 200px);
   overflow: auto;
 }
</style>
