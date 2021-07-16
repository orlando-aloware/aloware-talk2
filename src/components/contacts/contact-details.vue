<template>
  <div class="contact-details-wrapper">
    <div class="details-component-container" ref="detailsComponentContainer">
      <contact-info></contact-info>
      <contact-phones></contact-phones>
      <contact-information></contact-information>
      <contact-tags v-if="hasPermissionTo('tag contact')"></contact-tags>
      <contact-notes></contact-notes>
      <contact-integrations></contact-integrations>
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
import { mapGetters } from 'vuex'
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
    ...mapGetters('contacts', ['contact'])
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

<style lang="scss" scoped>
.contact-details-wrapper {
  height: 100%;
  display: flex;
  justify-content: flex-end;
  overflow: hidden;

  .details-component-container {
    height: calc(100vh - 80px);
    overflow: auto;
  }
}
</style>
