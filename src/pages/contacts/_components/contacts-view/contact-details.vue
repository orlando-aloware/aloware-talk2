<template>
  <div class="contact-details-wrapper">
    <div class="details-component-container">
      <contact-info></contact-info>
      <contact-phones></contact-phones>
      <contact-information></contact-information>
      <contact-tags></contact-tags>
      <contact-notes></contact-notes>
      <contact-integrations></contact-integrations>
      <contact-activity-counts></contact-activity-counts>
      <contact-lines></contact-lines>
      <contact-ring-groups></contact-ring-groups>
      <contact-broadcast></contact-broadcast>
    </div>
  </div>
</template>

<script>
import ContactPhones from 'pages/contacts/_components/contacts-view/contact-phones'
import ContactInfo from 'pages/contacts/_components/contacts-view/contact-info'
import ContactTags from 'pages/contacts/_components/contacts-view/contact-tags'
import ContactNotes from 'pages/contacts/_components/contacts-view/contact-notes'
import ContactActivityCounts from 'pages/contacts/_components/contacts-view/contact-activity-counts'
import ContactLines from 'pages/contacts/_components/contacts-view/contact-lines'
import ContactRingGroups from 'pages/contacts/_components/contacts-view/contact-ring-groups'
import ContactBroadcast from 'pages/contacts/_components/contacts-view/contact-broadcast'
import ContactInformation from 'pages/contacts/_components/contacts-view/contact-information'
import ContactIntegrations from 'pages/contacts/_components/contacts-view/contact-integrations'
export default {
  name: 'contact-details',
  components: {
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
