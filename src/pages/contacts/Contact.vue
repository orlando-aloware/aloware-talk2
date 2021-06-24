<template>
  <div class="row mx-0 content-row contact-view-wrapper d-flex">
    <contact-list-sidebar></contact-list-sidebar>
    <div :class="`px-0 mb-3 contact-activity-wrapper ${widthClass}`">
      <contact-activities :communications="filteredCommunications"></contact-activities>
    </div>
    <div class="px-0 mb-3 width-300">
      <contact-details></contact-details>
    </div>
  </div>
</template>

<script>
import ContactListSidebar from 'pages/contacts/_components/contacts-view/contact-list-sidebar'
import ContactActivities from 'pages/contacts/_components/contacts-view/contact-activities'
import ContactDetails from 'pages/contacts/_components/contacts-view/contact-details'
import contactsMixins from './contacts.mixins'
import contactMixins from '../../plugins/mixins/contact.mixin'

import { mapActions, mapGetters } from 'vuex'

export default {
  mixins: [contactsMixins, contactMixins],
  components: {
    ContactDetails,
    ContactActivities,
    ContactListSidebar
  },
  computed: {
    ...mapGetters('contacts', [ 'contact', 'isSidebarCollapsed' ]),
    widthClass () {
      return !this.isSidebarCollapsed ? 'w-less-600px' : 'w-less-315px'
    }
  },
  data () {
    return {
      title: 'Google Map List',
      totalContacts: 216
    }
  },
  methods: {
    ...mapActions('contacts', ['contactsLoaded', 'setContact']),
    getContact (id) {
      return this.fetchContactInfo(id).then(response => {
        this.setContact(response.data)
      })
    }
  },
  mounted () {
    this.contactId = this.$route.params.id
    this.processFetchContactInfo()
  },
  watch: {
    '$route.params.id': function (id) {
      this.getContact(id)
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
    padding-left: 1.90rem !important;

    .contact-activity-wrapper.w-less-600px {
      width: calc(100% - 600px)
    }

    .contact-activity-wrapper.w-less-315px {
      width: calc(100% - 315px)
    }
  }
</style>
