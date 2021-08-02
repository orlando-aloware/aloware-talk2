<template>
  <div class="contact-details-wrapper">
    <div class="details-component-container"
         ref="detailsComponentContainer">
      <contact-info></contact-info>
      <contact-phones></contact-phones>
      <contact-information></contact-information>
      <contact-tags :contact="contact"
                    @update="onTagsUpdate">
      </contact-tags>
      <contact-notes :contact="contact"
                     @input="onNotesInput">
      </contact-notes>
      <contact-integrations :contact="contact"></contact-integrations>
      <contact-scheduled-messages></contact-scheduled-messages>
      <contact-activity-counts></contact-activity-counts>
      <contact-lines></contact-lines>
      <contact-ring-groups></contact-ring-groups>
      <contact-broadcast></contact-broadcast>
    </div>
  </div>
</template>

<script>
import ContactPhones from 'src/components/contacts/contact-phones'
import ContactInfo from 'src/components/contacts/contact-info'
import ContactTags from 'src/components/contacts/contact-tags'
import ContactNotes from 'src/components/contacts/contact-notes'
import ContactActivityCounts from 'src/components/contacts/contact-activity-counts'
import ContactLines from 'src/components/contacts/contact-lines'
import ContactRingGroups from 'src/components/contacts/contact-ring-groups'
import ContactBroadcast from 'src/components/contacts/contact-broadcast'
import ContactInformation from 'src/components/contacts/contact-information'
import ContactIntegrations from 'src/components/contacts/contact-integrations'
import ContactScheduledMessages from 'src/components/contacts/contact-scheduled-messages'
import { mapGetters, mapActions } from 'vuex'
import { aclMixin } from 'src/plugins/mixins'

export default {
  name: 'contact-details',

  mixins: [aclMixin],

  components: {
    ContactScheduledMessages,
    ContactIntegrations,
    ContactInformation,
    ContactBroadcast,
    ContactRingGroups,
    ContactLines,
    ContactActivityCounts,
    ContactNotes,
    ContactTags,
    ContactInfo,
    ContactPhones
  },

  computed: {
    ...mapGetters('contacts', ['contact', 'contactClone'])
  },

  methods: {
    ...mapActions('contacts', ['setContact', 'setContactTags', 'updateChangedContactProperties']),
    onNotesInput (value) {
      this.updateChangedContactProperties({
        name: 'notes',
        value: value
      })
    },
    onTagsUpdate (tags) {
      this.setContactTags(tags)
    }
  },

  watch: {
    'contact.id': function () {
      this.$nextTick(() => {
        this.$refs.detailsComponentContainer.scrollTop = 0
      })
    }
  }
}
</script>
