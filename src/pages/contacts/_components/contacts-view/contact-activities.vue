<template>
  <div class="contact-activities">
        <contact-activities-header :label="contactName"/>
        <div class="p-3 contact-activity-container">
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

import _ from 'lodash'
import ContactActivitiesHeader from 'pages/contacts/_components/contact-activities-header'
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
  data () {
    return {
      contactName: 'Contact Name'
    }
  },
  computed: {
    ...mapGetters('contacts', [ 'contact', 'listItems', 'selectedList' ])
  },
  created () {
    this.updateContactName()
  },
  methods: {
    updateContactName () {
      const listId = _.get(this.selectedList, 'id', null)
      const contactId = parseInt(_.get(this.$route, 'params.id', null))
      const contactListItems = _.get(this.listItems, `${listId}.data`, null)
      if (contactListItems) {
        const contact = contactListItems.find(contact => contact.id === contactId)
        this.contactName = _.get(contact, 'name', 'Contact Name')
        return
      }
      this.contactName = 'Contact Name'
    }
  },
  components: {
    MessageComposer,
    ContactActivitiesHeader,
    ContactActivity
  },
  watch: {
    listItems: {
      deep: true,
      handler: function () {
        this.updateContactName()
      }
    },
    '$routes.params.id': function () {
      this.updateContactName()
    }
  }
}
</script>

<style lang="scss" scoped>
   .contact-activity-container {
     height: 100vh;
     overflow-y: scroll;
   }

   .contact-activities {
     margin-right: 10px;
     background-color: #fff;
   }
</style>
