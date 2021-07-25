import _ from 'lodash'
import auth from '../../boot/auth'
import { mapState, mapActions } from 'vuex'
import * as CommunicationTypes from 'src/constants/communication-types'
import * as CommunicationDispositionStatus from 'src/constants/communication-disposition-status'

export default {
  data () {
    return {
      auth: auth,
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
        unread_voicemail_count: 0,
        unread_missed_call_count: 0
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
        Authorization: 'Bearer ' + localStorage.getItem('api_token'),
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
      contactId: null
    }
  },

  computed: {
    ...mapState(['campaigns', 'currentCompany']),

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
          communications = this.communicationsAndAudits.filter(communication => ((communication.type !== undefined && [CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE].includes(communication.type)) || communication.type === undefined))
        } else if (this.type === undefined) {
          communications = this.communicationsAndAudits.filter(communication => [CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE].includes(communication.type))
        } else {
          // returns selected filter communications
          communications = this.communicationsAndAudits.filter(communication => communication.type === this.type)
        }
      }
      return communications
    },

    contactCampaignsFromCommunications () {
      if (this.selectedContact && this.campaigns.length) {
        let contactCampaigns = this.campaignsAlphabeticalOrder.filter((cmp) => {
          if (this.selectedContactCampaigns.includes(cmp.id)) {
            return true
          }
        })

        for (let campaign of contactCampaigns) {
          campaign.unread_count = this.communicationsAndAudits.filter((comm) => {
            if (comm.type && (comm.type === CommunicationTypes.SMS || (comm.type === CommunicationTypes.CALL && [CommunicationDispositionStatus.DISPOSITION_STATUS_VOICEMAIL_NEW, CommunicationDispositionStatus.DISPOSITION_STATUS_MISSED_NEW].includes(comm.disposition_status2))) && comm.is_read === false && comm.campaign_id === campaign.id) {
              return true
            }
          }).length
        }

        return contactCampaigns
      }

      return []
    },

    otherCampaignsFromCommunications () {
      if (this.campaigns && this.contactCampaignsFromCommunications) {
        return _.difference(this.campaignsAlphabeticalOrder, this.contactCampaignsFromCommunications)
      } else if (this.campaigns) {
        return this.campaignsAlphabeticalOrder
      }

      return []
    },

    campaignsAlphabeticalOrder () {
      if (this.campaigns) {
        let campaigns = _.clone(this.campaigns)
        return campaigns.sort((a, b) => {
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

      return !this.currentCompany.pipedrive_integration_enabled && !this.currentCompany.hubspot_integration_enabled && !this.currentCompany.stripe_integration_enabled && !this.currentCompany.zoho_integration_enabled && !this.currentCompany.helpscout_integration_enabled && !this.currentCompany.guesty_integration_enabled
    },

    isPushContactToCrmEnabled () {
      return this.resellerIdToPushContactToCrm.includes(this.currentCompany.reseller_id)
    }
  },

  created () {
    this.contact_id = _.get(this.$route, 'params.id', null)
    this.$VueEvent.listen('new_communication', (data) => {
      this.addNewCommunication(data)
    })

    this.$VueEvent.listen('update_communication', (data) => {
      this.updateCommunication(data)
    })

    this.$VueEvent.listen('delete_communication', (data) => {
      this.deleteCommunication(data)
    })

    this.$VueEvent.listen('contact_updated', (data) => {
      // check data loaded
      if (this.selectedContact && this.selectedContact.id === data.id) {
        this.updateSelectedContact(data)
      }
    })

    this.$VueEvent.listen('contact_audit_created', (data) => {
      // check data loaded
      if (parseInt(data.contact_id) === parseInt(this.contact_id)) {
        this.updateSelectedContactAudit(data)
        this.scrollMessages()
        if (this.$refs.contactActivities) {
          this.$refs.contactActivities.scrollMessages()
        }
      }
    })
  },

  methods: {
    addNewCommunication (data) {
      if (this.smsOnly && data.type !== CommunicationTypes.SMS) {
        return false
      }

      // checks if contact is the same in communication
      if (this.selectedContact && data.contact && this.selectedContact.id !== data.contact.id) {
        return false
      }

      // check data loaded
      if (this.communicationsAndAudits) {
        // check new communication exists in the old list
        const found = this.communicationsAndAudits.find(communication => communication.id === data.id)
        if (!found) {
          // push new data to top of array
          this.communicationsAndAudits.push(data)
          this.scrollMessages()
          if (this.$refs.contactActivities) {
            this.$refs.contactActivities.scrollMessages()
          }
        }
      }
    },

    updateCommunication (data) {
      // checks if contact is the same in communication
      if (this.selectedContact && data.contact && this.selectedContact.id !== data.contact.id) {
        return false
      }

      // check data loaded
      if (this.communicationsAndAudits) {
        // check new communication exists in the old list
        const found = this.communicationsAndAudits.find(communication => communication.id === data.id)
        if (found) {
          // update communication
          data = _.merge(found[0], data)
          this.$set(this.communicationsAndAudits, this.communicationsAndAudits.indexOf(found), data)
        }
      }
    },

    deleteCommunication (data) {
      // checks if contact is the same in communication
      if (this.selectedContact && data.contact && this.selectedContact.id !== data.contact.id) {
        return false
      }

      // check data loaded
      if (this.communicationsAndAudits) {
        // try to find the communication
        let found = this.communicationsAndAudits.find(communication => communication.id === data.id)
        if (found) {
          // remove it from the list
          this.communicationsAndAudits.splice(this.communicationsAndAudits.indexOf(found), 1)
        }
      }
    },

    async fetchContactInfo (contactId = null) {
      const id = contactId || this.contactId
      this.communicationsAndAudits = []
      this.communicationsPage = 1
      this.hasMoreCommunications = true
      this.loadingContact = true
      this.loadingContactCommunications = true
      return this.$axios.get(`/api/v1/contact/${id}`).then(res => {
        this.fetchContactCommunications(id, false)
          .then(() => {
            this.loadingContact = false

            // if route hash contains activity info, retrieve communications
            // until id is found
            if (this.isHashActivityType()) {
              this.loadingContactCommunications = true
              this.fetchContactCommunicationsUntilFound()
            } else {
              this.loadingContactCommunications = false
            }
          })
        return res
      }).catch(err => {
        this.loadingContact = false
        this.loadingContactCommunications = false
        this.$handleErrors(err.response)
        console.log(err)
      })
    },

    fetchedContactInfo (selectedContact) {
      this.communicationsAndAudits = []
      this.selectedContact = selectedContact
      this.selectedContact.tag_ids = this.selectedContact.tags.map((a) => a.id)
    },

    showContactInfo (contactId, forceClearLoading = false) {
      this.mapCommunicationsData()

      // 1. if contact has initial campaign and there were no communications select initial campaign
      if (!this.communicationsAndAudits.length && this.selectedContact && this.selectedContact.initial_campaign_id) {
        this.selectedCampaignId = this.selectedContact.initial_campaign_id
      }

      // 2. if contact has communications select last communication campaign
      if (!this.selectedCampaign && this.communicationsAndAudits.length) {
        const latestCommunication = _.find(_.orderBy(this.communicationsAndAudits, item => item.created_at, ['desc']), item => {
          return item.type === CommunicationTypes.SMS
        })
        if (latestCommunication) {
          this.selectedCampaignId = latestCommunication.campaign_id
        }
      }

      // 3. if user has a personal line and contact does not have an initial line
      const userCampaignId = _.get(this.auth, 'user.profile.campaign_id', null)
      if (!this.selectedCampaign && userCampaignId) {
        this.selectedCampaignId = userCampaignId
      }

      // 4. if contact doesn't have situation 1 and 2 and selected_contact_campaigns has one campaign select the campaign
      const selectedContactFirstCampaignId = _.get(this.selectedContactCampaigns, '[0].id', null)
      if (!this.selectedCampaign && selectedContactFirstCampaignId) {
        this.selectedCampaignId = selectedContactFirstCampaignId
      }

      // 5. if contact doesn't have situation 1 and 2 and 3 and company has one campaign select that campaign
      const firstCampaignId = _.get(this.campaigns, '[0].id', null)
      if (!this.selectedCampaign && !selectedContactFirstCampaignId && firstCampaignId) {
        this.selectedCampaignId = firstCampaignId
      }

      // 6. if contact doesn't have situation 1 and 2 and 3 and 4 and company has more then one campaign select the first one
      if (!this.selectedCampaign && firstCampaignId) {
        this.selectedCampaignId = firstCampaignId
      }

      this.selectedPhoneNumber = this.selectedContact ? this.selectedContact.phoneNumber : this.selectedPhoneNumber

      this.scrollMessages()
      if (this.$refs.contactActivities) {
        this.$refs.contactActivities.scrollMessages()
      }

      if (!this.smsOnly && (localStorage.getItem('PREVIOUS_ROUTE_NAME') !== 'Contacts' || forceClearLoading)) {
        this.loadingContactCommunications = false
      }
    },

    updateSelectedContact (contact) {
      if (_.isEmpty(contact) || _.isEmpty(this.selectedContact)) {
        return
      }

      for (let index in contact) {
        if (index === 'communications_and_audits') {
          continue
        }

        this.$set(this.selectedContact, index, contact[index])
      }
    },

    updateSelectedContactAudit (audit) {
      if (_.isEmpty(audit) || _.isEmpty(this.selectedContact)) {
        return
      }

      this.communicationsAndAudits.push(audit)
    },

    async fetchContactCommunications (contactId, skipContactInfo = true) {
      let lastAuditCreatedAt = null
      for (let index in this.communicationsAndAudits) {
        lastAuditCreatedAt = _.get(this.communicationsAndAudits, `[${index}].created_at`, null)
        if (lastAuditCreatedAt) {
          break
        }
      }
      return this.$axios.get(`/api/v1/contact/${contactId}/communications`, {
        params: {
          page: this.communicationsPage,
          per_page: this.communicationsPerPage,
          last_audit_created_at: lastAuditCreatedAt
        }
      }).then(res => {
        if (res.data.data && res.data.data.length) {
          this.communicationsAndAudits = res.data.data.concat(this.communicationsAndAudits)
        }

        this.hasMoreCommunications = res.data.has_more_pages
        this.communicationsPage++

        if (!skipContactInfo) {
          this.showContactInfo(this.contactId, true)
        }

        return res
      }).catch(err => {
        this.$handleErrors(err.response)
        this.loadingContactCommunications = false
        console.log(err)
      })
    },

    fetchContactCommunicationsUntilFound () {
      this.loadingContactCommunications = true

      // fetch communications until we found the activity id
      if (!this.isHashActivityFound()) {
        this.fetchContactCommunications(this.contactId).then(res => {
          if (res.data.has_more_pages) {
            this.fetchContactCommunicationsUntilFound()
          } else if (this.isHashActivityFound) {
            this.scrollIntoActivity()
            this.loadingContactCommunications = false
          } else {
            this.scrollMessages()
            if (this.$refs.contactActivities) {
              this.$refs.contactActivities.scrollMessages()
            }
            this.loadingContactCommunications = false
          }
        })
      } else { // we found the activity, scroll to it
        this.scrollIntoActivity()
        this.loadingContactCommunications = false
      }
    },

    mapCommunicationsData () {
      this.selectedContactCampaigns = []

      if (!this.selectedContact) {
        return
      }

      this.communicationsAndAudits.map((o) => {
        if (o.type !== undefined) {
          const found = this.selectedContactCampaigns.find(cmp => cmp === o.campaign_id)
          if (!found) {
            this.selectedContactCampaigns.push(o.campaign_id)
          }
          o.tag_ids = o.tags.map((a) => a.id)
        }
      })
    },

    loadMorePreviousActivities () {
      this.isLoadingPreviousActivities = true
      this.fetchContactCommunications(this.contact_id)
        .then(() => {
          this.isLoadingPreviousActivities = false
        })
        .catch(() => {
          this.isLoadingPreviousActivities = false
        })
    },

    changeSelectedPhoneNumber (phoneNumber) {
      this.selectedPhoneNumber = phoneNumber
      this.$q.notify({
        offset: 95,
        title: 'Contact',
        message: 'Changed selected contact phone number to: ' + this.selectedPhoneNumber,
        type: 'success',
        showClose: true
      })
      // this.setFocus()
    },

    resetSelectedContact () {
      this.selectedContact = null
      this.selectedCampaignId = null
      this.selectedPhoneNumber = null
      this.contactPhoneNumbers = []
    },

    markAllAsRead () {
      if (this.selectedCampaignId) {
        this.loadingMarkAsRead = true
        this.$axios.post(`/api/v1/contact/${this.selectedContact.id}/mark-as-read`).then(res => {
          this.loadingMarkAsRead = false
          for (let communication of this.filteredCommunications) {
            this.$set(communication, 'is_read', true)
          }
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
      this.$axios.post('/api/v1/campaign/send-message/' + this.selectedCampaignId + '/' + this.selectedContact.id, {
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
      this.$axios.post(`/api/v1/campaign/send-gif/${this.selectedCampaignId}/${this.selectedContact.id}`, {
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
      this.$q.notify({
        offset: 95,
        title: 'Media Upload',
        message: 'Media file has been uploaded successfully.',
        type: 'success',
        showClose: true
      })
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
      this.$axios.post(`/api/v1/campaign/send-mms/${this.selectedCampaignId}/${this.selectedContact.id}`, this.media)
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
      setTimeout(() => {
        let activitiesWrap = this.$refs.activitiesWrap
        if (activitiesWrap && activitiesWrap.scrollHeight) {
          activitiesWrap.scrollTop = activitiesWrap.scrollHeight
        }
      }, 250)
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
      let hash = this.$route.hash.replace('#', '')
      hash = hash.split('-')

      let activityType = hash[0] // communication, contact-audit, etc...
      let id = hash[1].trim()

      let found = null
      if (activityType === 'communication') {
        found = this.communicationsAndAudits.find(communication => communication.type !== undefined && communication.id.toString() === id)
      } else {
        found = this.communicationsAndAudits.find(communication => communication.property !== undefined && communication.id.toString() === id)
      }

      return !!found
    },

    scrollIntoActivity () {
      let hash = this.$route.hash.replace('#', '')
      let count = 0

      // scroll to activity
      let scrollInterval = setInterval(() => {
        const communicationActivity = _.get(this.$refs, `${hash}.0`, null)
        if (communicationActivity) {
          communicationActivity.$el.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'start'
          })
          // highlight the activity
          this.highlightActivity(communicationActivity.$el)
          clearInterval(scrollInterval)
        }

        // if we've been waiting for too long to load,
        // clear this interval
        if (count >= 40) {
          clearInterval(scrollInterval)
        }

        count++
      }, 250)
    },

    highlightActivity (element) {
      element.classList.add('shine')
      setTimeout(() => {
        element.classList.remove('shine')
      }, 3000)
    },

    fetchIncomingNumber () {
      this.contactIncomingNumber = null
      this.$axios.get(`/api/v1/contact/${this.selectedContact.id}/campaign/${this.selectedCampaign.id}/get-incoming-number`).then(res => {
        this.contact_incoming_number = res.data
      }).catch(err => {
        this.$handleErrors(err.response)
        console.log(err)
      })
    },

    checkEmailCapability () {
      if (this.currentCompany.sendgrid_integration_enabled || this.currentCompany.mailgun_integration_enabled) {
        this.canEmail = true
      } else {
        this.canEmail = false
        this.$axios.get(`/api/v1/intake-route/${this.selectedCampaign.id}/line`).then(res => {
          let intakeRoutes = res.data
          intakeRoutes.filter((route) => {
            if (route.type === 'email') {
              this.canEmail = true
            }
          })
        }).catch(err => {
          console.log(err)
          this.$handleErrors(err.response)
        })
      }
    },

    updateMessageComposer () {
      if (this.selectedCampaign && this.selectedCampaign.id && this.selectedContact && this.selectedContact.id) {
        this.fetchIncomingNumber()
        this.checkEmailCapability()
      }
    },

    processFetchContactInfo () {
      this.loadingContactInProgress()
      this.fetchContactInfo().then(res => {
        this.processFetchedContactInfo(res.data)
      }).catch(() => {
        this.loadingContactsFailed()
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
      } else {
        this.activeNames = this.activeNames.filter(name => name !== 'push-to-crm')
      }

      this.resetSelectedContact()
    },

    processFetchedContactInfo (selectedContact) {
      this.messageObject.contact = selectedContact
      this.fetchedContactInfo(selectedContact)
      this.contact.first_name = selectedContact.first_name
      this.contact.last_name = selectedContact.last_name
      // TODO: update contact name in title?
      // this.updateBreadcrumbContactName(this.contact)
      this.contact_phone_numbers = []
      this.$VueEvent.fire('contact_selected', this.contact_id)
      this.setContact(selectedContact)
    },

    loadingContactsFailed () {
      // TODO: do we need to do anything here?
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
          phone_number: phoneNumber,
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
          console.log('An error occurred while getting the contact', err)
          this.loadingContact = false
          return Promise.reject(err)
        } else {
          this.getContact(phoneNumber, getContactTry)
        }
      })
    },

    ...mapActions('contacts', ['setContact'])
  },

  watch: {
    selectedCampaign () {
      this.updateMessageComposer()
    }
  }
}
