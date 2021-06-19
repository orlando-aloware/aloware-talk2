<template>
  <div class="row mx-0 content-row contact-view-wrapper d-flex">
    <contact-list-sidebar></contact-list-sidebar>
    <div :class="`px-0 mb-3 contact-activity-wrapper ${widthClass}`">
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
import contactsMixins from './contacts.mixins'
import { mapActions, mapGetters } from 'vuex'
import contactsApi from './contacts.api'

export default {
  mixins: [contactsMixins],
  components: {
    ContactDetails,
    ContactActivity,
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
      return contactsApi.get(id).then(response => {
        this.setContact(response.data)
      })
    }
  },
  mounted () {
    this.getContact(this.$route.params.id)
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
