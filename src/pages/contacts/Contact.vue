<template>
  <b-overlay class="h-100 w-100"
             variant="white"
             rounded="sm"
             :show="isShowContact"
             :opacity="0.85"
             v-if="authenticated">
    <div class="mx-0 content-row contact-view-wrapper d-flex justify-content-between h-100"
         v-if="!leaving">
      <div class="contact-activity-wrapper flex-grow-1"
           :class="{ 'contact-activity--closed': detailsOpen || contactListSidebarOpen }"
           v-if="isShowContactActivities">
        <contact-activities ref="contactActivities"
                            :class="{ 'contact-activity--closed': detailsOpen }"
                            :communications="filteredCommunications"
                            :campaignId="selectedCampaignId"
                            :loadingCommunications="loadingContactCommunications"
                            v-if="!loadingContact && !changingSelectedContact && !isEmptyContact"
                            @markAllAsRead="markAllAsRead"
                            @toggleDrawer="toggleDrawer"
                            @toggleDetails="toggleDetails">
          <template v-slot:moreActivities>
            <q-btn outline
                   dense
                   rounded
                   no-caps
                   class="prev-activities mx-2"
                   color="primary"
                   size="md"
                   :loading="isLoadingPreviousActivities"
                   :disable="isLoadingPreviousActivities"
                   v-if="hasMoreCommunications"
                   @click="loadMorePreviousActivities">
              <div class="px-2">
                Previous Activities
              </div>
            </q-btn>
          </template>
        </contact-activities>
      </div>
      <div class="contact-details-container"
           :class="{ 'contact-details--opened': detailsOpen }"
           v-if="!campaignsIsLoading && !usersIsLoading && campaigns && users">
        <contact-details :campaign-id="selectedCampaignId"
                         v-if="!changingSelectedContact && !isEmptyContact"
                         @back="toggleDetails">
        </contact-details>
      </div>
      <q-drawer overlay
                bordered
                class="contact-details-container-drawer position-relative"
                side="right"
                :breakpoint="0"
                :width="300"
                v-model="drawer"
                v-if="!campaignsIsLoading && !usersIsLoading && campaigns && users">
        <compact-btn borderless
                     customClass="mt-1 contact-details-container-drawer__close d-flex justify-content-center"
                     variant="outlined-light"
                     @clicked="toggleDrawer">
          <close-icon width="18px"
                      height="18px"
                      icon-color="white">
          </close-icon>
        </compact-btn>
        <contact-details :campaign-id="selectedCampaignId"
                         v-if="drawer && !changingSelectedContact && !isEmptyContact">
        </contact-details>
      </q-drawer>
    </div>
    <template #overlay>
      <div class="text-center">
        <q-spinner-bars color="primary"
                        size="2em" />
        <p id="cancel-label">Fetching contact...</p>
      </div>
    </template>
  </b-overlay>
</template>

<script>
import ContactActivities from 'src/components/contacts/contact-activities'
import ContactDetails from 'src/components/contacts/contact-details'
import {
  contactMixin,
  contactV2AttributesMixin,
  aclMixin,
  visibilityMixin,
  inboxMixin
} from 'src/plugins/mixins'
import CompactBtn from 'src/components/compact-btn'
import { mapActions, mapGetters, mapState } from 'vuex'
import CloseIcon from 'components/icons/close-icon'
import * as ContactTaskStatus from 'src/constants/contact-task-status'
import * as CommunicationDirections from 'src/constants/communication-direction'
import _ from 'lodash'

export default {
  name: 'contact',

  mixins: [
    contactMixin,
    contactV2AttributesMixin,
    aclMixin,
    visibilityMixin,
    inboxMixin
  ],

  components: {
    CloseIcon,
    ContactDetails,
    ContactActivities,
    CompactBtn
  },

  computed: {
    ...mapGetters('contacts', [
      'contact',
      'isSidebarCollapsed',
      'changingSelectedContact'
    ]),

    ...mapGetters('auth', ['authenticated']),

    ...mapState([
      'contactDetailsDrawer',
      'campaignsIsLoading',
      'usersIsLoading',
      'tagsFullyLoaded',
      'campaigns',
      'users',
      'tags'
    ]),

    isInbox () {
      return ['Inbox Contact', 'Inbox Contact Task', 'Inbox', 'Inbox Contact Communication'].includes(this.$route.name)
    },

    isEmptyContact () {
      return Object.keys(this.contact).length === 0
    },

    isShowContact () {
      return this.changingSelectedContact || this.campaignsIsLoading ||
        this.usersIsLoading || !this.tagsFullyLoaded || !this.campaigns ||
        !this.users || !this.tags || this.leaving || this.loadingContact || this.isEmptyContact
    },

    isShowContactActivities () {
      return !this.campaignsIsLoading && !this.usersIsLoading &&
        this.tagsFullyLoaded && this.campaigns && this.users && this.tags
    }
  },

  data () {
    return {
      title: 'Contact',
      totalContacts: 0,
      drawer: false,
      detailsOpen: false,
      contactListSidebarOpen: false,
      leaving: false,
      contactComponentListeners: {},
      ContactTaskStatus,
      CommunicationDirections
    }
  },

  methods: {
    ...mapActions('contacts', [
      'resetChangedContactProperties',
      'selectedContactChanging',
      'setContact',
      'setContactClone'
    ]),

    ...mapActions(['setContactDetailsDrawer']),

    fetchContact: _.debounce(function () {
      this.selectedContactChanging(true)

      // OPTION: Changes selected marker on contact list, even before fetching data,
      // but after enabling loading overlay
      // let contactList = _.get(this.$parent.$data, 'contactsData.data', [])
      // let selectedContact = contactList.filter(({ id }) => id === this.contactId)
      // if (selectedContact.length > 0) this.setContact(selectedContact[0])

      this.processFetchContactInfo((selectedContact) => {
        this.setContact(selectedContact)
        this.setContactClone(selectedContact)
        this.resetChangedContactProperties([])
        this.selectedContactChanging(false)
      })
    }, 1000),

    toggleDrawer () {
      this.drawer = !this.drawer
      this.setContactDetailsDrawer(this.drawer)
    },

    toggleDetails () {
      this.detailsOpen = !this.detailsOpen
    }
  },

  mounted () {
    if (this.authenticated) {
      this.fetchContact()
    }

    this.contactComponentListeners.contactUpdated = (data) => {
      const contactId = parseInt(data.id)

      // check if we're in the correct contact route and
      // contact object
      if (this.contact &&
        parseInt(this.contact.id) === contactId &&
        parseInt(this.$route.params.id) === contactId) {
        // just update the contact attributes
        const updatedContact = this.$jsonClone(this.contact)
        const contact = this.$jsonClone(data)
        // add the v2 contact attributes that we need
        Object.assign(contact, this.addV2ContactAttributes(contact))
        Object.assign(updatedContact, contact)
        this.setContact(updatedContact)
      }
    }

    this.contactComponentListeners.contactAuditCreated = (data) => {
      // check if current contact is the same as audit's contact id
      if (this.contact &&
        parseInt(this.contact.id) === parseInt(data.contact_id) &&
        data.property === 'contact_task_status') {
        const contact = _.cloneDeep(this.contact)
        contact.task_status = parseInt(data.to)
        this.setContact(contact)
      }
    }

    this.contactComponentListeners.contactDisposed = (disposedContact) => {
      if (disposedContact.id === this.contact.id) {
        const contact = _.cloneDeep(this.contact)
        contact.disposition_status_id = disposedContact.disposition_status_id
        this.setContact(contact)
      }
    }

    this.$VueEvent.listen('contact_updated', this.contactComponentListeners.contactUpdated)
    this.$VueEvent.listen('contact_audit_created', this.contactComponentListeners.contactAuditCreated)
    this.$VueEvent.listen('contact_disposed', this.contactComponentListeners.contactDisposed)
  },

  created () {
    this.setIsContactMixinUsed(true)
    this.initListeners()

    this.contactComponentListeners.contactTaskStatusUpdated = (contact) => {
      if (this.contact.id === contact.id) {
        this.setContact(contact)
      }

      if (['Contact', 'Inbox Contact', 'Inbox Contact Task', 'Inbox Contact Communication'].includes(this.$route.name)) {
        this.setLoadingPendingTaskCount(true)
        this.getContactsCountByTaskStatus(this.ContactTaskStatusPending)
        this.setLoadingOpenTaskCount(true)
        this.getContactsCountByTaskStatus(this.ContactTaskStatusOpen)
      }
    }

    this.$VueEvent.listen('contact_task_status_updated', this.contactComponentListeners.contactTaskStatusUpdated)
  },

  watch: {
    '$route.params.id': function (value) {
      // Show loading overlay as soon as id changes
      this.selectedContactChanging(true)

      this.contactListSidebarOpen = false

      if (['Contact', 'Inbox Contact', 'Inbox Contact Task', 'Inbox Contact Communication'].includes(this.$route.name) && this.contactId !== value) {
        this.resetSelectedContact()
        this.contactId = value
        this.fetchContact()
        return
      }

      if (this.contact.id === this.selectedContact.id) {
        this.setContact(this.selectedContact)
      }

      this.resetSelectedContact()
    },

    '$route.params.communicationId': function (value) {
      if (['Inbox Contact', 'Inbox Contact Communication'].includes(this.$route.name)) {
        this.fetchContactCommunicationsUntilFound()
      }
    },

    contactDetailsDrawer () {
      if (!this.contactDetailsDrawer) {
        this.drawer = false
      }
    },

    'contact.task_status': function (newValue, oldValue) {
      if (newValue === ContactTaskStatus.STATUS_PENDING &&
        oldValue === ContactTaskStatus.STATUS_OPEN) {
        this.communicationsAndAudits.map((communicationsAndAudit, index) => {
          if (communicationsAndAudit?.direction === CommunicationDirections.INBOUND) {
            this.communicationsAndAudits[index].is_read = true
          }
        })
      }
    }
  },

  beforeRouteUpdate () {
    this.leaving = false
  },

  beforeDestroy () {
    this.setIsContactMixinUsed(false)
    this.removeListeners()
    this.setContact({})
    this.$VueEvent.stop('contact_updated', this.contactComponentListeners.contactUpdated)
    this.$VueEvent.stop('contact_audit_created', this.contactComponentListeners.contactAuditCreated)
    this.$VueEvent.stop('contact_disposed', this.contactComponentListeners.contactDisposed)
    this.$VueEvent.stop('contact_task_status_updated', this.contactComponentListeners.contactTaskStatusUpdated)
  },

  beforeRouteLeave (to, from, next) {
    this.leaving = true
    next()
  }
}
</script>
