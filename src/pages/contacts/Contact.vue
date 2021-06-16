<template>
  <div class="row mx-0 content-row contact-details-wrapper">
    <div class="col-lg-3 px-0 mb-3">
      <contact-list-sidebar></contact-list-sidebar>
    </div>
    <div class="col-lg-6 px-0 mb-3 main">
      <contact-activity></contact-activity>
    </div>
    <div class="col-lg-3 px-0 mb-3 main">
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
  .contact-details-wrapper {
    border-top: 1px solid #dee2e6;
    overflow: hidden;
    position: relative;
  }
</style>
