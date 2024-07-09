import _ from 'lodash'
import { mapState, mapActions } from 'vuex'
import * as CommunicationTypes from 'src/constants/communication-types'
import * as InboxTaskStatus from 'src/constants/inbox-task-status'
import * as storage from 'src/plugins/helpers/storage'
import talk2Api from 'src/plugins/api/api'
import { DEFAULT_PINNED_LIST } from 'src/constants/contacts-list-default-pinned-list'
import { CONTACTS_ACCESS_EVERYONE } from 'src/constants/contact-access-types'

export default {
  data () {
    return {
      hasMoreCommunications: true,
      selectedPhoneNumber: null,
      selectedCampaignId: null,
      communicationsAndAudits: [],
      loadingContact: false,
      loadingContactCommunications: false,
      loadingSendMessage: false,
      loadingMarkAsRead: false,
      selectedContact: {
        id: null,
        first_name: null,
        last_name: null,
        cnam_country: null,
        cnam_state: null,
        cnam_city: null,
        cnam_zipcode: null,
        company_name: null,
        address: null,
        email: null,
        timezone: null,
        notes: '',
        csf1: null,
        csf2: null,
        date_of_birth: false,
        phone_number: null,
        is_blocked: false,
        communications: [],
        campaign_ids: [],
        user: null,
        user_id: null,
        lrn_type: null,
        is_dnc: false,
        tags: [],
        tag_ids: [],
        unread_count: 0,
        unread_voicemails_count: 0,
        unread_missed_calls_count: 0,
        unread_texts_count: 0
      },
      selectedContactCampaigns: [],
      contactPhoneNumbers: [],
      communicationsPage: 1,
      communicationsPerPage: 10,
      contactIncomingNumber: null,
      canEmail: false,
      type: 0,
      smsOnly: false,
      replyText: '',
      sendMediaDialogVisible: false,
      giphyMediaDialogVisible: false,
      loadingSendMediaBtn: false,
      media: {
        file_name: null,
        body: null,
        files: []
      },
      uploadPercentage: {
        import: 0,
        upload: 0
      },
      uploadStatus: {
        import: 'success',
        upload: 'success'
      },
      uploadFileList: {
        import: [],
        upload: []
      },
      rulesMedia: {
        fileName: [
          {
            required: true,
            message: 'Please upload your media file',
            trigger: 'change'
          }
        ]
      },
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + storage.local.getItem('api_token'),
        'X-Socket-Id': window.Echo ? window.Echo.socketId() : ''
      },
      isLoadingPreviousActivities: false,
      activityTypes: [
        'communication',
        'contact-audit'
      ],
      // push to CRM feature exclusive for ss, just in case new company is added, then just add the reseller id here
      resellerIdToPushContactToCrm: [357],
      messageObject: {
        phone_number: null
      },
      activeNames: ['phone_numbers', 'about', 'lines', 'ring-groups'],
      contactId: null,
      cancelToken: null,
      source: null,
      communicationApiCancelToken: null,
      communicationApiSource: null,
      contactActivitiesInterval: null,
      containerElInterval: null,
      scrollInterval: null,
      skipComponents: [
        'line-selector',
        'contact-details',
        'message-composer'
      ],
      listeners: {},
      contactFetchFailed: false
    }
  },

  computed: {
    ...mapState('auth', [
      'profile'
    ]),

    ...mapState(['campaigns', 'auth']),

    ...mapState('contacts', [
      'contact',
      'communicationsSummary',
      'newCommunicationInprogressContactFetch'
    ]),

    ...mapState('inbox', { selectContact: 'selectedContact' }),

    ...mapState('cache', ['currentCompany']),

    selectedCampaign () {
      if (this.campaigns) {
        return this.campaigns.find(campaign => campaign.id === this.selectedCampaignId)
      }

      return null
    },

    filteredCommunications () {
      let communications = []

      if (this.communicationsAndAudits) {
        if (this.type !== undefined && this.type === 0) {
          // returns all communications
          communications = this.communicationsAndAudits
        } else if (this.type !== undefined && this.type === CommunicationTypes.NOTE) {
          // returns all note communications
          communications = this.communicationsAndAudits.filter(communication =>
            CommunicationTypes.NOTE_TYPES.includes(communication?.type) || communication.type === undefined
          )
        } else if (this.type === undefined) {
          communications = this.communicationsAndAudits.filter(communication =>
            CommunicationTypes.NOTE_TYPES.includes(communication.type)
          )
        } else {
          // returns selected filter communications
          communications = this.communicationsAndAudits.filter(communication =>
            communication.type === this.type
          )
        }
      }

      return communications.reduce((acc, current) => {
        const x = acc.find(item => item.id === current.id)

        if (!x) {
          return acc.concat([current])
        }

        return acc
      }, [])
    },

    contactCampaignsFromCommunications () {
      if (this.contact && this.campaigns.length) {
        return this.campaignsAlphabeticalOrder
      }

      return []
    },

    otherCampaignsFromCommunications () {
      if (this.campaigns && this.contactCampaignsFromCommunications) {
        return _.difference(this.campaignsAlphabeticalOrder, this.contactCampaignsFromCommunications)
      }

      if (this.campaigns) {
        return this.campaignsAlphabeticalOrder
      }

      return []
    },

    campaignsAlphabeticalOrder () {
      if (this.campaigns) {
        return _.clone(this.campaigns).sort((a, b) => {
          const textA = a.name.toUpperCase()
          const textB = b.name.toUpperCase()

          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
        })
      }

      return []
    },

    integrationsDisabled () {
      if (!this.currentCompany) {
        return true
      }

      if (this.currentCompany.id === 460) {
        return false
      }

      return !this.currentCompany.pipedrive_integration_enabled &&
        !this.currentCompany.hubspot_integration_enabled &&
        !this.currentCompany.stripe_integration_enabled &&
        !this.currentCompany.zoho_integration_enabled &&
        !this.currentCompany.helpscout_integration_enabled &&
        !this.currentCompany.guesty_integration_enabled
    },

    isPushContactToCrmEnabled () {
      return this.currentCompany
        ? this.resellerIdToPushContactToCrm.includes(this.currentCompany.reseller_id)
        : false
    },

    addTemporaryCommunication (communication) {
      this.communicationsAndAudits = [...this.communicationsAndAudits, communication]
    }
  },

  created () {
    this.contactId = _.get(this.$route, 'params.id', this.selectContact.id)
    this.cancelToken = window.axios.CancelToken
    this.source = this.cancelToken.source()

    this.communicationApiCancelToken = window.axios.CancelToken
    this.communicationApiSource = this.communicationApiCancelToken.source()

    if (this.skipComponents.includes(this.$options.name)) {
      return
    }

    this.listeners.newCommunication = (data) => {
      if (!this.checkCommunicationMatchesUserAccessibility(data)) {
        return
      }

      this.addNewCommunication(data)
      this.processContactUpdate(data.contact, data)
    }

    this.listeners.updateCommunication = (data) => {
      if (!this.checkCommunicationMatchesUserAccessibility(data)) {
        return
      }

      this.updateCommunication(data)
    }

    this.listeners.deleteCommunication = (data) => {
      this.deleteCommunication(data)
    }

    this.listeners.contactUpdated = (data) => {
      // update the current contact
      this.processContactUpdate(data, null, true)
    }

    this.listeners.contactAuditCreated = (data) => {
      // check data loaded
      if (!_.isEmpty(this.contact) &&
        data.contact_id !== null &&
        data.contact_id !== undefined &&
        parseInt(data.contact_id) === parseInt(this.contact.id)) {
        this.updateSelectedContactAudit(data)
        this.scrollMessages()
      }
    }

    this.listeners.fetchContactInfo = (callback) => {
      this.processFetchContactInfo(callback)
    }

    this.listeners.updateContactInGroup = (contact) => {
      // update contact in the group of contacts
      // only in Contact page
      if (this.$route.name === 'Contact') {
        this.updateContacts(contact)
      }
    }
  },

  methods: {
    initListeners () {
      this.$VueEvent.listen('new_communication', this.listeners.newCommunication)
      this.$VueEvent.listen('update_communication', this.listeners.updateCommunication)
      this.$VueEvent.listen('delete_communication', this.listeners.deleteCommunication)
      this.$VueEvent.listen('contact_updated', this.listeners.contactUpdated)
      this.$VueEvent.listen('contact_audit_created', this.listeners.contactAuditCreated)
      this.$VueEvent.listen('fetch_contact_info', this.listeners.fetchContactInfo)
      this.$VueEvent.listen('update-contact-in-group', this.listeners.updateContactInGroup)
    },

    removeListeners () {
      this.$VueEvent.stop('new_communication', this.listeners.newCommunication)
      this.$VueEvent.stop('update_communication', this.listeners.updateCommunication)
      this.$VueEvent.stop('delete_communication', this.listeners.deleteCommunication)
      this.$VueEvent.stop('contact_updated', this.listeners.contactUpdated)
      this.$VueEvent.stop('contact_audit_created', this.listeners.contactAuditCreated)
      this.$VueEvent.stop('fetch_contact_info', this.listeners.fetchContactInfo)
      this.$VueEvent.stop('update-contact-in-group', this.listeners.updateContactInGroup)
    },

    isCommOrAuditExists (communication, data) {
      // if communication and data is a communication (has type attribute),
      // check if ids match
      if ('type' in communication &&
        'type' in data &&
        communication.id === data.id) {
        return true
      }

      // if communication and data is a contact audit (no type attribute),
      // check if ids match. Else, false
      return !('type' in communication) &&
        !('type' in data) &&
        communication.id === data.id
    },

    isNotSameContact (contactId) {
      const isContactIdEmpty = [null, undefined].includes(contactId)
      const isContactEmpty = _.isEmpty(this.contact)
      const isNotSameContact = !isContactEmpty &&
        !isContactIdEmpty &&
        parseInt(this.contact.id) !== parseInt(contactId)

      return isContactEmpty ||
        isContactIdEmpty ||
        isNotSameContact
    },

    addNewCommunication (data) {
      if (this.smsOnly &&
        data.type !== CommunicationTypes.SMS) {
        return false
      }

      // checks if contact is the same in communication
      if (this.isNotSameContact(data.contact_id)) {
        return false
      }

      // check new communication exists in the old list
      const found = this.communicationsAndAudits
        .find(communication => this.isCommOrAuditExists(communication, data))

      if (!found) {
        // push new data to top of array
        this.communicationsAndAudits.push(data)
        this.removeDuplicateCommunicationsAndAudits()
        this.scrollMessages()
      }
    },

    processContactUpdate (contact, communication = null, deleteCommsAndAudits = false) {
      const contactEvent = this.$jsonClone(contact)
      let newCommunication = null
      if (communication) {
        newCommunication = this.$jsonClone(communication)
      }

      // check if communication's contact is the same as the current contact
      if (parseInt(contact.id) === parseInt(this.contact.id)) {
        const updatedContact = this.$jsonClone(this.contact)
        // add the v2 contact attributes that we need
        Object.assign(contact, this.addV2ContactAttributes(contactEvent, newCommunication, updatedContact))

        if (deleteCommsAndAudits) {
          delete contact.communications_and_audits
        }

        Object.assign(updatedContact, contact)
        this.setContact(updatedContact)
        this.setContactClone(updatedContact)
        this.updateSelectedContact(updatedContact)

        // update the contact/task in Inbox
        this.$VueEvent.fire('contact_updated_from_contact_mixin', contact)
      }

      // update contact in inbox's group of contacts/tasks
      if (!_.isEmpty(newCommunication)) {
        this.$VueEvent.fire('inbox_contact_updated', {
          contact: contactEvent,
          communication: newCommunication
        })
      }
    },

    removeDuplicateCommunicationsAndAudits: _.debounce(function () {
      this.communicationsAndAudits = _.uniqBy(this.communicationsAndAudits, 'id')
    }, 500),

    updateCommunication (data) {
      // checks if contact is the same in communication
      if (this.isNotSameContact(data.contact_id)) {
        return false
      }

      // check data loaded
      if (!_.isEmpty(this.communicationsAndAudits)) {
        // check new communication exists in the old list
        const index = this.communicationsAndAudits
          .findIndex(communication => this.isCommOrAuditExists(communication, data))

        if (index > -1) {
          // update communication
          Object.assign(this.communicationsAndAudits[index], data)
        }
      }
    },

    deleteCommunication (data) {
      // checks if contact is the same in communication
      if (this.isNotSameContact(data.contact_id)) {
        return false
      }

      // check data loaded
      if (!_.isEmpty(this.communicationsAndAudits)) {
        // try to find the communication
        const index = this.communicationsAndAudits
          .findIndex(communication => this.isCommOrAuditExists(communication, data))

        if (index > -1) {
          // remove it from the list
          this.communicationsAndAudits.splice(index, 1)
        }
      }
    },

    fetchFailedNotification (response) {
      let message = 'Cannot find Contact.'
      const messageWithVisibilityLimit = ' Check your Contacts Visibility settings.'
      const hasVisibilityLimit = this.profile.contacts_visibility !== CONTACTS_ACCESS_EVERYONE
      message += hasVisibilityLimit ? messageWithVisibilityLimit : ''

      if (response?.status === 404 && !this.fetchFailed) {
        this.$generalNotification(message, 'error-redirect', 5000, hasVisibilityLimit, {
          path: `/settings/visibility`
        })
      } else if (!this.fetchFailed) {
        this.$handleErrors(response)
      }

      this.fetchFailed = true
    },

    async fetchContactInfo (isFetchContact = true, contactId = null, skipRouterPush = false) {
      const contactIdToFetch = contactId || this.contactId

      // Sanity check: if contact id is actually one of the lists, take person to the list
      if (Object.values(DEFAULT_PINNED_LIST).map(item => item.id).includes(contactIdToFetch)) {
        if (skipRouterPush) {
          return
        }

        const path = '/contacts/list/' + contactIdToFetch

        this.$router.push({ path })

        return
      }

      // Sanity check: if contact id is actually a weird number, just redirect to inbox
      if (isNaN(Number.parseInt(contactIdToFetch))) {
        if (skipRouterPush) {
          return
        }

        this.$router.push({ name: 'inbox' })
        return
      }

      this.communicationsAndAudits = []
      this.communicationsPage = 1
      this.hasMoreCommunications = true
      this.loadingContact = true
      this.loadingContactCommunications = true
      this.fetchFailed = false

      if (!contactIdToFetch) {
        console.log('Failed to fetch contact info: Missing contact id!')
        this.loadingContact = false
        this.loadingContactCommunications = false
        return false
      }

      this.source.cancel('Fetch contact info operation canceled by the user.')
      this.source = this.cancelToken.source()

      // get contact phone numbers
      talk2Api.V1.contact.getPhoneNumbers(contactIdToFetch)
        .then(response => {
          this.setContactPhoneNumbers(response.data)
        }).catch(err => {
          console.log(err)
          this.fetchFailedNotification(err.response)
        })

      // get conflicted contact phone numbers
      talk2Api.V1.contact.getConflictedPhoneNumbers(contactIdToFetch)
        .then(response => {
          this.setConflictedContactPhoneNumbers(response.data)
        }).catch(err => {
          console.log(err)
          this.fetchFailedNotification(err.response)
        })

      // get contact's communication summary
      talk2Api.V1.contact.getCommunicationsSummary(contactIdToFetch)
        .then(response => {
          // Object.keys(response.data.summaries).forEach(key => response.data.summaries[key] = response.data.summaries[key] || 0)
          this.setCommunicationSummary(response.data)
        }).catch(err => {
          console.log(err)
          this.fetchFailedNotification(err.response)
        })

      this.setSequenceInfoLoading(true)

      // get contact's sequence info
      talk2Api.V1.contact.getSequenceInfo(contactIdToFetch)
        .then(response => {
          this.setSequenceInfo(response.data)
          this.setSequenceInfoLoading(false)
        }).catch((err) => {
          this.setSequenceInfoLoading(false)
          console.log(err)
          this.fetchFailedNotification(err.response)
        })

      // get contact's contact attributes
      talk2Api.V1.contact.getAttributes(contactIdToFetch)
        .then(response => {
          this.setContactAttributes(_.cloneDeep(response.data))
        }).catch(err => {
          console.log(err)
          this.fetchFailedNotification(err.response)
        })

      // get contact's communications
      this.fetchContactCommunications(contactIdToFetch, false, false)
        .then(res => {
          this.loadingContact = false

          if (!res) {
            this.loadingContactCommunications = false

            return
          }

          // if route has communication id
          // until id is found
          if (res && this.hasCommunication()) {
            this.loadingContactCommunications = true
            this.fetchContactCommunicationsUntilFound()
          }

          this.scrollMessages()
        }).catch(err => {
          if (window.axios.isCancel(err)) {
            console.log('Request canceled', err.message)
          }

          this.fetchFailedNotification(err.response)
          this.loadingContactCommunications = false
          console.log(err)
        })

      if (!isFetchContact) {
        this.$VueEvent.fire('contact_activity_clear_change_from_fetch')

        return
      }

      // get contact's info
      return this.$axios.get(`/api/v2/contacts/${contactIdToFetch}`,
        {
          cancelToken: this.source.token
        })
        .then(res => {
          this.$VueEvent.fire('contact_activity_clear_change_from_fetch')

          if (res) {
            this.$VueEvent.fire('contact_activity_update_contact_from_fetch', res.data)

            return res
          }
        }).catch(err => {
          this.$VueEvent.fire('contact_activity_clear_change_from_fetch')

          if (this.$axios.isCancel(err) && err) {
            console.log('Request canceled', err.message)
            this.loadingContact = false

            return
          }

          this.fetchFailedNotification(err.response)

          // inside Inbox
          if (this.$route.name.includes('Inbox')) {
            return
          }

          // not in Inbox
          if (!this.$route.name.includes('Inbox')) {
            this.$router.push({ path: '/contacts' })
          }
        }).finally(() => {
          this.loadingContact = false
          this.loadingContactCommunications = false
        })
    },

    showContactInfo (contactId, forceClearLoading = false) {
      this.mapCommunicationsData()

      // 1. if contact has initial campaign and there were no communications select initial campaign
      if (!this.communicationsAndAudits.length && this.contact && this.contact.initial_campaign_id) {
        this.selectedCampaignId = this.contact.initial_campaign_id
      }

      // 2. if contact has communications select last communication campaign
      if (!this.selectedCampaignId && this.communicationsAndAudits.length) {
        // Get the latest communication that is either SMS or CALL
        const latestCommunication = _.find(_.orderBy(this.communicationsAndAudits, item => item.created_at, ['desc']), item => {
          return item.type === CommunicationTypes.SMS || item.type === CommunicationTypes.CALL
        })

        if (latestCommunication) {
          this.selectedCampaignId = latestCommunication.campaign_id
        }
      }

      // 3. if user has a personal line and contact does not have an initial line
      const userCampaignId = _.get(this.profile, 'campaign_id', null)

      if (!this.selectedCampaignId && userCampaignId) {
        this.selectedCampaignId = userCampaignId
      }

      // 4. if contact doesn't have situation 1 and 2 and selected_contact_campaigns has one campaign select the campaign
      const selectedContactFirstCampaignId = _.get(this.selectedContactCampaigns, '[0].id', null)

      if (!this.selectedCampaignId && selectedContactFirstCampaignId) {
        this.selectedCampaignId = selectedContactFirstCampaignId
      }

      // 5. if contact doesn't have situation 1 and 2 and 3 and company has one campaign select that campaign
      const firstCampaignId = _.get(this.campaigns, '[0].id', null)

      if (!this.selectedCampaignId && !selectedContactFirstCampaignId && firstCampaignId) {
        this.selectedCampaignId = firstCampaignId
      }

      // 6. if contact doesn't have situation 1 and 2 and 3 and 4 and company has more then one campaign select the first one
      if (!this.selectedCampaignId && firstCampaignId) {
        this.selectedCampaignId = firstCampaignId
      }

      this.selectedPhoneNumber = this.contact ? this.contact.phoneNumber : this.selectedPhoneNumber

      this.scrollMessages()

      if (!this.smsOnly && (storage.local.getItem('PREVIOUS_ROUTE_NAME') !== 'Contacts' || forceClearLoading)) {
        this.loadingContactCommunications = false
      }
    },

    updateSelectedContact (contact) {
      if (_.isEmpty(contact) || _.isEmpty(this.contact) || (contact.id !== this.contact.id)) {
        return
      }

      contact.communications_and_audits = _.get(this.contact, 'communications_and_audits', [])
    },

    updateSelectedContactAudit (audit) {
      if (_.isEmpty(audit) || _.isEmpty(this.contact)) {
        return
      }

      const found = this.communicationsAndAudits
        .find(communication => this.isCommOrAuditExists(communication, audit))

      if (!found) {
        this.communicationsAndAudits.push(audit)
      }
    },

    async fetchContactCommunications (contactId, skipContactInfo = true, useDefaultCatch = true) {
      this.communicationApiSource.cancel('fetchContactCommunications operation canceled by the user.')
      this.communicationApiSource = this.communicationApiCancelToken.source()
      let lastAuditCreatedAt = null

      for (const item in this.communicationsAndAudits) {
        lastAuditCreatedAt = _.get(this.communicationsAndAudits, `[${item}].created_at`, null)

        if (lastAuditCreatedAt) {
          break
        }
      }

      return this.$axios.get(`/api/v1/contact/${contactId}/communications`, {
        params: {
          page: this.communicationsPage,
          per_page: this.communicationsPerPage,
          last_audit_created_at: lastAuditCreatedAt
        },
        cancelToken: this.communicationApiSource.token
      }).then(res => {
        if (res.data.data && res.data.data.length) {
          this.communicationsAndAudits = this.communicationsAndAudits.filter(item => 'id' in item)
          this.communicationsAndAudits = res.data.data.concat(this.communicationsAndAudits)
        }

        this.hasMoreCommunications = res.data.has_more_pages
        this.communicationsPage++

        if (!skipContactInfo) {
          this.showContactInfo(this.contactId, true)
        }

        return res
      }).catch(err => {
        if (!useDefaultCatch) {
          return
        }

        if (window.axios.isCancel(err)) {
          console.log('Request canceled', err.message)
        }

        this.$handleErrors(err.response)

        this.loadingContactCommunications = false
        console.log(err)
      })
    },

    fetchContactCommunicationsUntilFound (tryCount = 1) {
      if (tryCount > 10) {
        this.loadingContactCommunications = false
        this.$generalNotification('Communication is too old for automatic scrolling', 'error')

        return
      }

      this.loadingContactCommunications = true

      // we found the activity, scroll to it
      if (this.isCommunicationFound()) {
        this.scrollIntoActivity()
        this.loadingContactCommunications = false

        return
      }

      // fetch communications until we found the activity id
      this.fetchContactCommunications(this.contactId).then(res => {
        if (!res) {
          this.scrollMessages()
          this.loadingContactCommunications = false

          return
        }

        if (res.data.has_more_pages) {
          tryCount++
          this.fetchContactCommunicationsUntilFound(tryCount)
        } else if (this.isCommunicationFound()) {
          this.scrollIntoActivity()
          this.loadingContactCommunications = false
        } else {
          this.scrollMessages()
          this.loadingContactCommunications = false
        }
      }).catch(() => {
        this.loadingContactCommunications = false
      })
    },

    mapCommunicationsData () {
      this.selectedContactCampaigns = []

      if (!this.contact) {
        return
      }

      this.communicationsAndAudits.map((o) => {
        if (o.type !== undefined) {
          const found = this.selectedContactCampaigns.find(cmp => cmp === o.campaign_id)

          if (!found) {
            this.selectedContactCampaigns.push(o.campaign_id)
          }

          o.tag_ids = !_.isEmpty(o.tags) ? o.tags.map((a) => a.id) : []
        }
      })
    },

    loadMorePreviousActivities () {
      this.isLoadingPreviousActivities = true

      this.fetchContactCommunications(this.contactId).then(() => {
        this.isLoadingPreviousActivities = false
      }).catch(() => {
        this.isLoadingPreviousActivities = false
      })
    },

    changeSelectedPhoneNumber (phoneNumber) {
      this.selectedPhoneNumber = phoneNumber
      this.$generalNotification(`Changed selected contact phone number to: ${this.selectedPhoneNumber}`)
      // this.setFocus()
    },

    resetSelectedContact () {
      if (!this.cancelToken) {
        this.cancelToken = this.$axios.CancelToken
      }

      this.source = this.cancelToken.source()
      this.contactId = null
      this.selectedCampaignId = null
      this.selectedPhoneNumber = null
      this.contactPhoneNumbers = []
    },

    markAllAsRead () {
      if (this.contact) {
        this.loadingMarkAsRead = true

        this.$axios.post(`/api/v1/contact/${this.contact.id}/mark-as-read`).then(res => {
          this.loadingMarkAsRead = false

          for (let index in this.communicationsAndAudits) {
            if (typeof this.communicationsAndAudits[index].is_read !== 'undefined') {
              this.communicationsAndAudits[index].is_read = true
            }
          }

          this.$VueEvent.fire('mark_contact_communications_all_as_read', res.data)
          this.$VueEvent.fire('contact_updated', res.data)
        }).catch(err => {
          this.$handleErrors(err.response)
          this.loadingMarkAsRead = false
        })
      }
    },

    sendMessage (event) {
      if (event && event.shiftKey === true && event.key === 'Enter') {
        return
      }

      this.markAllAsRead()
      this.loadingSendMessage = true

      this.$axios.post('/api/v1/campaign/send-message/' + this.selectedCampaignId + '/' + this.contact.id, {
        message: this.reply_text,
        phone_number: this.selectedPhoneNumber
      }).then(res => {
        this.reply_text = ''
        this.loadingSendMessage = false
      }).catch(err => {
        this.$handleErrors(err.response)
        this.loadingSendMessage = false
      })
    },

    sendGifMessage (url) {
      this.closeGiphyMediaModal()
      this.markAllAsRead()
      this.loadingSendMessage = true

      this.$axios.post(`/api/v1/campaign/send-gif/${this.selectedCampaignId}/${this.contact.id}`, {
        url: url,
        phone_number: this.selectedPhoneNumber
      }).then(res => {
        this.loadingSendMessage = false
      }).catch(err => {
        this.$handleErrors(err.response)
        this.loadingSendMessage = false
      })
    },

    openSendMediaModal () {
      this.sendMediaDialogVisible = true
      this.resetSendMediaContactsForm('media')
    },

    closeSendMediaModal () {
      this.sendMediaDialogVisible = false
      this.resetSendMediaContactsForm('media')
    },

    openGiphyMediaModal () {
      this.giphyMediaDialogVisible = true
    },

    closeGiphyMediaModal () {
      this.giphyMediaDialogVisible = false
    },

    beforeCloseSendMediaModal (done) {
      this.$bvModal.msgBoxConfirm('Are you sure you want to leave? You have not sent any media yet', {
        title: 'Warning',
        size: 'sm',
        buttonSize: 'sm',
        okVariant: 'danger',
        okTitle: 'Yes, Leave',
        cancelTitle: 'No, Stay',
        footerClass: 'p-2',
        hideHeaderClose: false,
        centered: true
      })
        .then(value => {
          this.boxTwo = value
          done()
        })
        .catch(err => {
          // An error occurred
          console.log(err)
          done()
        })
    },

    onChangeFileList (file, fileList) {
      this.uploadFileList.upload = fileList
    },

    onSuccessSendMedia (res) {
      this.$generalNotification('Media file has been uploaded successfully.')
      this.$set(this.media, 'file_name', res.file_name)
      this.uploadStatus.upload = 'success'
      // TODO: validate the form
    },

    onFailedSendMedia (err) {
      this.$handleUploadErrors(err.message)
      this.uploadStatus.upload = 'exception'
      this.uploadPercentage.upload = 0
      // TODO: validate the form
    },

    beforeUploadSendMedia () {
      this.uploadStatus.upload = 'success'
      this.uploadPercentage.upload = 0
    },

    progressUploadSendMedia (event) {
      this.uploadPercentage.upload = parseInt(event.percent)
    },

    sendMedia () {
      // TODO: check if media form is validated
      // if (this.validateForm('media') == true) {
      this.loadingSendMediaBtn = true
      this.media.phone_number = this.selectedPhoneNumber
      this.media.files = this.uploadFileList.upload.map(item => item.response.file_name)

      this.$axios.post(`/api/v1/campaign/send-mms/${this.selectedCampaignId}/${this.contact.id}`, this.media)
        .then(res => {
          this.loadingSendMediaBtn = false
          this.resetSendMediaContactsForm('media')
          this.sendMediaDialogVisible = false
          this.uploadPercentage.upload = 0
          this.uploadStatus.upload = 'success'
          this.uploadFileList.upload = []
        })
        .catch(err => {
          console.log(err)
          this.$handleErrors(err.response)
          this.loadingSendMediaBtn = false
        })
      // }
    },

    resetSendMediaContactsForm (formName) {
      this.media.file_name = null
      this.media.body = null
      this.media.files = []
      this.uploadFileList.upload = []
      this.uploadPercentage.upload = 0
      this.uploadStatus.upload = 'success'
      // TODO: reset the form
    },

    setFocus () {
      this.$nextTick(() => {
        if (this.$refs.reply_text) {
          this.$refs.reply_text.focus()
        }
      })
    },

    addToMessage (event) {
      this.reply_text += event.target.text.trim()
      this.setFocus()
    },

    scrollMessages () {
      const counter = { data: 0 }
      clearInterval(this.contactActivitiesInterval)

      this.contactActivitiesInterval = setInterval(() => {
        if (this.$refs.contactActivities) {
          this.$refs.contactActivities.scrollMessages()
          clearInterval(this.contactActivitiesInterval)
        }

        counter.data++

        if (counter.data > 180) {
          clearInterval(this.contactActivitiesInterval)
        }
      }, 250)
    },

    hasCommunication () {
      return this.$route.params.communicationId
    },

    isCommunicationFound () {
      return this.$route.params.communicationId &&
        !!this.communicationsAndAudits.find(communication => 'type' in communication &&
          communication.id.toString() === this.$route.params.communicationId.toString())
    },

    isHashActivityType () {
      if (!this.$route.hash) {
        return false
      }

      let hasActivity = false

      for (let type of this.activityTypes) {
        if (this.$route.hash.includes(type)) {
          hasActivity = true
          break
        }
      }

      if (!hasActivity) {
        return false
      }

      let hash = this.$route.hash
      hash = hash.split('-')

      // hash only has 2 items: activity type and id
      return hash.length === 2
    },

    isHashActivityFound () {
      const hash = (this.$route.hash.replace('#', '')).split('-')
      const id = hash[1].trim()

      return !!(hash[0] === 'communication'
        ? this.communicationsAndAudits.find(communication => 'type' in communication &&
          communication.id.toString() === id)
        : this.communicationsAndAudits.find(communication => !('type' in communication) &&
          communication.id.toString() === id))
    },

    scrollIntoActivity () {
      const communication = this.communicationsAndAudits.find(communication => communication.id.toString() === this.$route.params.communicationId.toString())
      const ref = (communication.type !== undefined ? 'communication-' : 'contact-audit-') + communication.id
      let count = 0
      let communicationActivity = null

      // scroll to activity
      clearInterval(this.scrollInterval)
      this.scrollInterval = setInterval(() => {
        communicationActivity = (this.$refs.contactActivities)
          ? _.get(this.$refs.contactActivities.$refs, `${ref}.0`, null)
          : null

        if (communicationActivity) {
          communicationActivity.$el.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'start'
          })
          // highlight the activity
          this.highlightActivity(communicationActivity)
          clearInterval(this.scrollInterval)
        }

        // if we've been waiting for too long to load,
        // clear this interval
        if (count >= 120) {
          clearInterval(this.scrollInterval)
        }

        count++
      }, 250)
    },

    highlightActivity (commActivity) {
      const element = commActivity.$el

      if (!element) {
        return
      }

      if (!_.isEmpty(commActivity.$refs) && commActivity.$refs.communicationInfo.$refs.communicationInfoExpansionItem) {
        commActivity.$refs.communicationInfo.$refs.communicationInfoExpansionItem.show()
        let counter = 0
        let containerEl = null

        this.containerElInterval = setInterval(() => {
          containerEl = document.querySelector('.contact-activities .scrollbar-white')

          if (containerEl) {
            containerEl.scrollTop = element.offsetTop
            clearInterval(this.containerElInterval)
          }

          counter++

          if (counter > 120) {
            clearInterval(this.containerElInterval)
          }
        }, 500)
      }

      const highlighted = document.querySelector('.shine')

      if (highlighted) {
        highlighted.classList.remove('shine')
      }

      element.classList.add('shine')

      setTimeout(() => {
        element.classList.remove('shine')
      }, 5000)
    },

    fetchIncomingNumber: _.debounce(function () {
      if (this.contact && this.selectedCampaign) {
        this.contactIncomingNumber = null

        this.$axios.get(`/api/v1/contact/${this.contact.id}/campaign/${this.selectedCampaign.id}/get-incoming-number`).then(res => {
          this.contactIncomingNumber = res.data
        }).catch(err => {
          this.$handleErrors(err.response)
          console.log(err)
        })
      }
    }, 200),

    checkEmailCapability () {
      const mailIntegrationEnabled = this.currentCompany.sendgrid_integration_enabled || this.currentCompany.mailgun_integration_enabled

      if (this.currentCompany && mailIntegrationEnabled) {
        this.canEmail = true

        return
      }

      this.canEmail = this.selectedCampaign.email_intake && this.selectedCampaign.email_intake_route_id
    },

    updateMessageComposer () {
      if (this.selectedCampaign && this.selectedCampaign.id && this.contact && this.contact.id) {
        this.checkEmailCapability()
      }
    },

    updateLineIncomingNumber () {
      if (this.contact && this.contact.id && !_.isEmpty(this.selectedCampaign)) {
        this.setLineIncomingNumberLoading(true)

        talk2Api.V1.contact.getLineIncomingNumber(this.contact.id, this.selectedCampaign.id).then(response => {
          this.setLineIncomingNumber(response.data)
        }).finally(() => {
          this.setLineIncomingNumberLoading(false)
        })
      }
    },

    processFetchContactInfo (callback, isFetchContact = true) {
      this.loadingContactInProgress()

      return this.fetchContactInfo(isFetchContact).then(res => {
        if (!res) {
          this.selectedContactChanging(false)
          return
        }

        const contactTaskStatus = this.$options.filters.fixTaskStatusName(res.data.task_status).toLowerCase()
        const isAllCurrentTaskStatus = this.$route.params.status === InboxTaskStatus.STATUS_ALL

        // if contact status changes then redirect to the right url
        if (this.$route.name === 'Inbox Contact Task' && contactTaskStatus !== this.$route.params.status && !isAllCurrentTaskStatus) {
          this.$router.push({
            name: 'Inbox Contact Task',
            params: {
              id: res.data.id,
              channel: 'inbox',
              status: contactTaskStatus
            }
          }).catch(err => {
            console.log(err)
          })
        }

        // if contact has no task status, then fallback to all status
        if (this.$route.name === 'Inbox Contact Task' && !res.data.task_status) {
          this.$router.push({
            name: 'Inbox Contact Task',
            params: {
              id: res.data.id,
              channel: 'inbox',
              status: InboxTaskStatus.DEFAULT_STATUS
            }
          }).catch(err => {
            console.log(err)
          })
        }

        this.processFetchedContactInfo(res.data, callback)

        if (['Inbox Contact Task'].includes(this.$route.name)) {
          this.setSelectedContact(res.data)
        }
      }).catch((err) => {
        console.log('err: ', err)
        // this.loadingContactsFailed()
      })
    },

    loadingContactInProgress () {
      if (!this.integrationsDisabled) {
        this.activeNames.push('integrations')
        this.activeNames.push('integration-cards')
      } else {
        this.activeNames = this.activeNames.filter(name => name !== 'integrations' && name !== 'integration-cards')
      }

      if (this.isPushContactToCrmEnabled) {
        this.activeNames.push('push-to-crm')

        return
      }

      this.activeNames = this.activeNames.filter(name => name !== 'push-to-crm')
    },

    processFetchedContactInfo (selectedContact, callback) {
      selectedContact.tag_ids = selectedContact.tags.map((tag) => tag.id)
      this.messageObject.contact = selectedContact
      // TODO: update contact name in title?
      // this.updateBreadcrumbContactName(this.contact)
      this.contact_phone_numbers = []
      this.$VueEvent.fire('contact_selected', this.contactId)

      if (typeof callback === 'function') {
        callback(selectedContact)
      }
    },

    loadingContactsFailed () {
      this.$generalNotification('Failed to load contacts.', 'error')
      this.$router.replace({
        name: 'Contacts'
      })
    },

    loadMoreContacts () {
      if (this.pagination && this.pagination.to && this.filter.page <= this.pagination.to) {
        this.filter.page += 1

        this.getContacts()
          .then(res => {
            this.loadingContact = false
            this.$router.push({
              name: 'Contact',
              params: { contact_id: res.data.data[0].id }
            }).catch(err => {
              console.log(err)
            })
          })
          .catch(err => {
            this.loadingContact = false
            console.log(err)
          })
      } else {
        this.loadingContact = false
      }
    },

    getContactByPhoneNumber (phoneNumber, getContactTry = 1) {
      if (!this.$options.filters.fixPhone(phoneNumber)) {
        return Promise.reject('Phone number is not valid')
      }

      this.loadingContact = true
      return this.$axios.get('/api/v1/contact/phone-number', {
        params: {
          phone_number: this.$options.filters.fixPhone(phoneNumber),
          load_info: 0
        }
      }).then(res => {
        this.loadingContact = false
        return Promise.resolve(res.data)
      }).catch(err => {
        getContactTry++
        // check if we have found the contact after 3 retries
        if (getContactTry > 3) {
          // error
          console.log('An error occurred while getting the contact', err?.response?.data || err)
          this.loadingContact = false
          this.$generalNotification('Contact not found, please try again.', 'error')
          return Promise.reject(err)
        } else {
          this.getContactByPhoneNumber(phoneNumber, getContactTry)
        }
      })
    },

    addContactByPhoneNumber (phoneNumber) {
      if (!this.$options.filters.fixPhone(phoneNumber)) {
        return Promise.reject('Phone number is not valid')
      }

      return this.$axios.post('/api/v1/contact', {
        add_phone_number: this.$options.filters.fixPhone(phoneNumber)
      }).then(res => {
        return Promise.resolve(res.data)
      })
    },

    ...mapActions('contacts', [
      'setContact',
      'setContactClone',
      'resetChangedContactProperties',
      'updateContacts',
      'setContactPhoneNumbers',
      'setConflictedContactPhoneNumbers',
      'setSequenceInfoLoading',
      'setSequenceInfo',
      'setLineIncomingNumberLoading',
      'setLineIncomingNumber',
      'setCommunicationSummary',
      'setContactAttributes',
      'setIsContactMixinUsed'
    ]),

    ...mapActions('inbox', ['setSelectedContact'])
  },

  watch: {
    'selectedCampaign.id': _.debounce(function (value) {
      this.updateMessageComposer()
      this.updateLineIncomingNumber()
    }, 1000),

    contactId: function () {
      this.communicationsPage = 1
    }
  },

  beforeDestroy () {
    this.$VueEvent.stop('fetch_contact_info', this.listeners.fetchContactInfo)
    clearInterval(this.contactActivitiesInterval)
    clearInterval(this.containerElInterval)
    clearInterval(this.scrollInterval)
  }
}
