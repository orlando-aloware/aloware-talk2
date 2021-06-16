<template>
  <div class="row mx-0 content-row contact-view-wrapper pl-lg-4">
    <div class="px-0 mb-3 width-300">
      <contact-list-sidebar></contact-list-sidebar>
    </div>
    <div class="px-0 mb-3 contact-activity-wrapper">
      <contact-activity></contact-activity>
    </div>
    <div class="px-0 mb-3 width-300">
      <contact-details></contact-details>
    </div>
  </div>
</template>

<script>
import ContactListSidebar from 'pages/contacts/_components/contacts-view/contact-list-sidebar'
import ContactActivity from 'pages/contacts/_components/contacts-view/contact-activity'
import ContactDetails from 'pages/contacts/_components/contacts-view/contact-details'

export default {
  components: {
    ContactDetails,
    ContactActivity,
    ContactListSidebar
  },
  data () {
    return {
      title: 'Google Map List',
      totalContacts: 216
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
@import 'src/css/breakpoints.scss';
  .contact-view-wrapper {
    border-top: 1px solid #dee2e6;
    overflow: hidden;
    position: relative;
    background: #F4F4F6;

    .width-300 {
      width: 300px;
    }

    .contact-activity-wrapper {
      width: calc(100% - 600px)
    }
  }
</style>
