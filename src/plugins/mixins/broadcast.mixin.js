import Echo from 'laravel-echo'
import _ from 'lodash'
import * as storage from 'src/plugins/helpers/storage'
import { mapActions, mapState } from 'vuex'

export default {
  computed: {
    ...mapState('auth', ['profile', 'authenticated']),
    ...mapState('cache', ['currentCompany']),
    ...mapState(['campaigns', 'filters'])
  },
  methods: {
    ...mapActions([
      'setUserStatus',
      'updateCampaign',
      'newCampaign',
      'updateCampaign',
      'deleteCampaign',
      'newFilter',
      'updateFilter',
      'deleteFilter',
      'newWorkflow',
      'updateWorkflow',
      'deleteWorkflow',
      'newTag',
      'updateTag',
      'deleteTag',
      'newDispositionStatus',
      'updateDispositionStatus',
      'deleteDispositionStatus',
      'newBulkCallDisposition',
      'newCallDisposition',
      'updateCallDisposition',
      'deleteCallDisposition'
    ]),
    ...mapActions('cache', ['setCurrentCompany']),
    broadcastInit () {
      console.log('initiating broadcast')
      /**
       * Echo exposes an expressive API for subscribing to channels and listening
       * for events that are broadcast by Laravel. Echo and event broadcasting
       * allows your team to easily build robust real-time web applications.
       */
      window.Echo = new Echo({
        authEndpoint: `${process.env.API_URL}/broadcasting/auth`,
        broadcaster: 'pusher',
        key: storage.local.getItem('pusher_app_key'),
        cluster: storage.local.getItem('pusher_cluster'),
        encrypted: true,
        auth: {
          headers: {
            Authorization: `Bearer ${storage.local.getItem('api_token')}`
          }
        }
      })
      console.log('broadcast initiated')
      this.broadcastListen()
    },
    broadcastListen () {
      let userId = _.get(this.profile, 'id', null)

      if (!userId) {
        return
      }

      window.Echo.private('user-' + userId)
        .listen('.user.status.updated', (event) => {
          this.setUserStatus(event.status)
        })
        .listen('.user.in-app.contact.contact_assigned', (event) => {
          let contact = event.contact
          if (event.tags) {
            contact.tags = event.tags
            contact.tag_ids = contact.tags.map((a) => a.id)
          }
          if (event.user) {
            contact.user = event.user
          }
          this.$VueEvent.fire('new_in_app_contact_assigned', contact)
        })
        .listen('.user.in-app.appointment', (event) => {
          let engagement = event.engagement
          let contact = event.contact
          let timeDiff = event.time_diff
          let unit = event.unit
          this.$VueEvent.fire('new_in_app_appointment', { engagement, contact, timeDiff, unit })
        })
        .listen('.user.in-app.reminder', (event) => {
          let engagement = event.engagement
          let contact = event.contact
          let timeDiff = event.timeDiff
          let unit = event.unit
          this.$VueEvent.fire('new_in_app_reminder', { engagement, contact, timeDiff, unit })
        })
        .listen('.user.in-app.communication.new_call', (event) => {
          let campaign = this.campaigns.find(campaign => campaign.id === event.communication.campaign_id)
          if (campaign) {
            let communication = event.communication
            communication.campaign = campaign
            if (event.tags) {
              communication.tags = event.tags
              communication.tag_ids = communication.tags.map((a) => a.id)
            }
            if (event.contact) {
              communication.contact = event.contact
            }
            if (event.contact_tags && communication && communication.contact) {
              communication.contact.tags = event.contact_tags
            }
            if (event.owner) {
              communication.owner = event.owner
            }
            this.$VueEvent.fire('new_in_app_call', communication)
          }
        })
        .listen('.user.in-app.communication.answered_call', (event) => {
          let campaign = this.campaigns.find(campaign => campaign.id === event.communication.campaign_id)
          if (campaign) {
            let communication = event.communication
            communication.campaign = campaign
            if (event.tags) {
              communication.tags = event.tags
              communication.tag_ids = communication.tags.map((a) => a.id)
            }
            if (event.contact) {
              communication.contact = event.contact
            }
            if (event.contact_tags && communication && communication.contact) {
              communication.contact.tags = event.contact_tags
            }
            if (event.owner) {
              communication.owner = event.owner
            }
            this.$VueEvent.fire('answered_in_app_call', communication)
          }
        })
        .listen('.user.in-app.communication.new_sms', (event) => {
          let campaign = this.campaigns.find(campaign => campaign.id === event.communication.campaign_id)
          if (campaign) {
            let communication = event.communication
            communication.campaign = campaign
            if (event.tags) {
              communication.tags = event.tags
              communication.tag_ids = communication.tags.map((a) => a.id)
            }
            if (event.contact) {
              communication.contact = event.contact
            }
            if (event.contact_tags && communication && communication.contact) {
              communication.contact.tags = event.contact_tags
            }
            if (event.owner) {
              communication.owner = event.owner
            }
            this.$VueEvent.fire('new_in_app_sms', communication)
          }
        })
        .listen('.user.in-app.communication.new_voicemail', (event) => {
          let campaign = this.campaigns.find(campaign => campaign.id === event.communication.campaign_id)
          if (campaign) {
            let communication = event.communication
            if (event.tags) {
              communication.tags = event.tags
              communication.tag_ids = event.tags.map((a) => a.id)
            }
            if (event.contact) {
              communication.contact = event.contact
            }
            if (event.contact_tags && communication && communication.contact) {
              communication.contact.tags = event.contact_tags
            }
            if (event.owner) {
              communication.owner = event.owner
            }
            this.$VueEvent.fire('new_in_app_voicemail', communication)
          }
        })
        .listen('.user.in-app.communication.new_fax', (event) => {
          let campaign = this.campaigns.find(campaign => campaign.id === event.communication.campaign_id)
          if (campaign) {
            let communication = event.communication
            communication.campaign = campaign
            if (event.tags) {
              communication.tags = event.tags
              communication.tag_ids = communication.tags.map((a) => a.id)
            }
            if (event.contact) {
              communication.contact = event.contact
            }
            if (event.contact_tags && communication && communication.contact) {
              communication.contact.tags = event.contact_tags
            }
            if (event.owner) {
              communication.owner = event.owner
            }
            this.$VueEvent.fire('new_in_app_fax', communication)
          }
        })
        .listen('.user.desktop.contact.contact_assigned', (event) => {
          let contact = event.contact
          if (event.tags) {
            contact.tags = event.tags
            contact.tag_ids = contact.tags.map((a) => a.id)
          }
          if (event.user) {
            contact.user = event.user
          }
          this.$VueEvent.fire('new_desktop_contact_assigned', contact)
        })
        .listen('.user.desktop.appointment', (event) => {
          let engagement = event.engagement
          let contact = event.contact
          let timeDiff = event.timeDiff
          let unit = event.unit
          this.$VueEvent.fire('new_desktop_appointment', { engagement, contact, timeDiff, unit })
        })
        .listen('.user.desktop.reminder', (event) => {
          let engagement = event.engagement
          let contact = event.contact
          let timeDiff = event.timeDiff
          let unit = event.unit
          this.$VueEvent.fire('new_desktop_reminder', { engagement, contact, timeDiff, unit })
        })
        .listen('.user.desktop.communication.new_call', (event) => {
          let campaign = this.campaigns.find(campaign => campaign.id === event.communication.campaign_id)
          if (campaign) {
            let communication = event.communication
            communication.campaign = campaign
            if (event.tags) {
              communication.tags = event.tags
              communication.tag_ids = event.tags.map((a) => a.id)
            }
            if (event.contact) {
              communication.contact = event.contact
            }
            if (event.contact_tags) {
              communication.contact.tags = event.contact_tags
            }
            if (event.owner) {
              communication.owner = event.owner
            }
            this.$VueEvent.fire('new_desktop_call', communication)
          }
        })
        .listen('.user.desktop.communication.answered_call', (event) => {
          let campaign = this.campaigns.find(campaign => campaign.id === event.communication.campaign_id)
          if (campaign) {
            let communication = event.communication
            communication.campaign = campaign
            if (event.tags) {
              communication.tags = event.tags
              communication.tag_ids = event.tags.map((a) => a.id)
            }
            if (event.contact) {
              communication.contact = event.contact
            }
            if (event.contact_tags) {
              communication.contact.tags = event.contact_tags
            }
            if (event.owner) {
              communication.owner = event.owner
            }
            this.$VueEvent.fire('new_answered_call', communication)
          }
        })
        .listen('.user.desktop.communication.new_sms', (event) => {
          let campaign = this.campaigns.find(campaign => campaign.id === event.communication.campaign_id)
          if (campaign) {
            let communication = event.communication
            communication.campaign = campaign
            if (event.tags) {
              communication.tags = event.tags
              communication.tag_ids = event.tags.map((a) => a.id)
            }
            if (event.contact) {
              communication.contact = event.contact
            }
            if (event.contact_tags) {
              communication.contact.tags = event.contact_tags
            }
            if (event.owner) {
              communication.owner = event.owner
            }
            this.$VueEvent.fire('new_desktop_sms', communication)
          }
        })
        .listen('.user.desktop.communication.new_voicemail', (event) => {
          let campaign = this.campaigns.find(campaign => campaign.id === event.communication.campaign_id)
          if (campaign) {
            let communication = event.communication
            communication.campaign = campaign
            if (event.tags) {
              communication.tags = event.tags
              communication.tag_ids = event.tags.map((a) => a.id)
            }
            if (event.contact) {
              communication.contact = event.contact
            }
            if (event.contact_tags) {
              communication.contact.tags = event.contact_tags
            }
            if (event.owner) {
              communication.owner = event.owner
            }
            this.$VueEvent.fire('new_desktop_voicemail', communication)
          }
        })
        .listen('.user.desktop.communication.new_fax', (event) => {
          let campaign = this.campaigns.find(campaign => campaign.id === event.communication.campaign_id)
          if (campaign) {
            let communication = event.communication
            communication.campaign = campaign
            if (event.tags) {
              communication.tags = event.tags
              communication.tag_ids = event.tags.map((a) => a.id)
            }
            if (event.contact) {
              communication.contact = event.contact
            }
            if (event.contact_tags) {
              communication.contact.tags = event.contact_tags
            }
            if (event.owner) {
              communication.owner = event.owner
            }
            this.$VueEvent.fire('new_desktop_fax', communication)
          }
        })

        /**
         * ------------------------------------
         * Power Dialer Session Tasks
         * ------------------------------------
         */
        .listen('.user.contact_list_item.created', (event) => {
          // console.log(' %c LISTENING: Contact list item created ', 'background: green; color: #fff;', event)
          let contactListItem = event.contact_list_item
          if (event.contact) {
            contactListItem.contact = event.contact
          }
          if (event.communication) {
            contactListItem.communication = event.communication
            if (contactListItem.contact) {
              contactListItem.communication.contact = contactListItem.contact
            }
          }
          window.VueEvent.fire('contact_list_item_created', contactListItem)
        })
        .listen('.user.contact_list_item.updated', (event) => {
          // console.log(' %c LISTENING: Contact list item updated ', 'background: green; color: #fff;', event)
          let contactListItem = event.contact_list_item
          if (event.contact) {
            contactListItem.contact = event.contact
          }
          if (event.communication) {
            contactListItem.communication = event.communication
            if (contactListItem.contact) {
              contactListItem.communication.contact = contactListItem.contact
            }
          }
          window.VueEvent.fire('contact_list_item_updated', contactListItem)
        })
        .listen('.user.contact_list_item.deleting', (event) => {
          // console.log(' %c LISTENING: Contact list item deleting... ', 'background: green; color: #fff;', event)
          window.VueEvent.fire('contact_list_item_deleting', event.contact_list_item)
        })
        /**
         * End of Power Dialer Session Tasks
         */

        .notification((notification) => {
          if (!this.profile.sleep_mode) {
            switch (notification.type) {
              case 'App\\Notifications\\MentionNotification':
                this.$VueEvent.fire('mention', notification)
                break
            }
          }
        })
      window.Echo.private('company-' + this.profile.company_id)
        .listen('.company.updated', (event) => {
          if (this.currentCompany && this.currentCompany.id === event.company.id) {
            this.setCurrentCompany(event.company)
          }
        })
        .listen('.communication.created', (event) => {
          let communication = event.communication
          if (event.tags) {
            communication.tags = event.tags
            communication.tag_ids = communication.tags.map((a) => a.id)
          }
          if (event.contact) {
            communication.contact = event.contact
          }
          if (event.owner) {
            communication.owner = event.owner
          }
          let campaign = this.campaigns.find(campaign => campaign.id === event.communication.campaign_id)
          if (campaign) {
            communication.campaign = campaign
          }
          this.$VueEvent.fire('new_communication', communication)
        })
        .listen('.communication.updated', (event) => {
          let communication = event.communication
          if (event.tags) {
            communication.tags = event.tags
            communication.tag_ids = communication.tags.map((a) => a.id)
          }
          if (event.contact) {
            communication.contact = event.contact
          }
          if (event.owner) {
            communication.owner = event.owner
          }
          let campaign = this.campaigns.find(campaign => campaign.id === event.communication.campaign_id)
          if (campaign) {
            communication.campaign = campaign
          }
          this.$VueEvent.fire('update_communication', communication)
        })
        .listen('.communication.deleted', (event) => {
          this.$VueEvent.fire('delete_communication', event.communication)
        })
        .listen('.incoming_number.created', (event) => {
          let campaign = this.campaigns.find(campaign => campaign.id === event.incoming_number.campaign_id)
          if (campaign) {
            campaign.incoming_number = event.incoming_number.phone_number
            this.updateCampaign(campaign)
          }
        })
        .listen('.campaign.created', (event) => {
          let campaign = event.campaign
          campaign.last_call_datetime = event.last_call_datetime
          this.newCampaign(campaign)
          this.$VueEvent.fire('campaign_created', campaign)
        })
        .listen('.campaign.updated', (event) => {
          let campaign = event.campaign
          campaign.last_call_datetime = event.last_call_datetime
          this.updateCampaign(campaign)
          this.$VueEvent.fire('campaign_updated', campaign)
        })
        .listen('.campaign.deleted', (event) => {
          this.deleteCampaign(event.campaign)
          this.$VueEvent.fire('campaign_deleted', event.campaign)
        })
        .listen('.tag.created', (event) => {
          let tag = event.tag
          this.newTag(tag)
          this.$VueEvent.fire('tag_created', tag)
        })
        .listen('.tag.updated', (event) => {
          let tag = event.tag
          this.updateTag(tag)
          this.$VueEvent.fire('tag_updated', tag)
        })
        .listen('.tag.deleting', (event) => {
          let tag = event.tag
          this.deleteTag(tag)
          this.$VueEvent.fire('tag_deleting', tag)
        })
        .listen('.disposition_status.created', (event) => {
          let dispositionStatus = event.disposition_status
          this.newDispositionStatus(dispositionStatus)
          this.$VueEvent.fire('disposition_status_created', dispositionStatus)
        })
        .listen('.disposition_status.updated', (event) => {
          let dispositionStatus = event.disposition_status
          this.updateDispositionStatus(dispositionStatus)
          this.$VueEvent.fire('disposition_status_updated', dispositionStatus)
        })
        .listen('.disposition_status.deleted', (event) => {
          let dispositionStatus = event.disposition_status
          this.deleteDispositionStatus(dispositionStatus)
          this.$VueEvent.fire('disposition_status_deleted', dispositionStatus)
        })
        .listen('.call_disposition.bulk_created', (event) => {
          let callDispositions = event.call_dispositions
          this.newBulkCallDisposition(callDispositions)
          this.$VueEvent.fire('call_disposition_bulk_created', callDispositions)
        })
        .listen('.call_disposition.created', (event) => {
          let callDisposition = event.call_disposition
          this.newCallDisposition(callDisposition)
          this.$VueEvent.fire('call_disposition_created', callDisposition)
        })
        .listen('.call_disposition.updated', (event) => {
          let callDisposition = event.call_disposition
          this.updateCallDisposition(callDisposition)
          this.$VueEvent.fire('call_disposition_updated', callDisposition)
        })
        .listen('.call_disposition.deleted', (event) => {
          let callDisposition = event.call_disposition
          this.deleteCallDisposition(callDisposition)
          this.$VueEvent.fire('call_disposition_deleted', callDisposition)
        })
        .listen('.contact.created', (event) => {
          let contact = event.contact
          if (contact) {
            if (event.user) {
              contact.user = event.user
            }
            if (event.tags) {
              contact.tags = event.tags
              contact.tag_ids = contact.tags.map((a) => a.id)
            }
            this.$VueEvent.fire('contact_created', contact)
          }
        })
        .listen('.contact.updated', (event) => {
          let contact = event.contact
          if (contact) {
            if (event.user) {
              contact.user = event.user
            }
            if (event.tags) {
              contact.tags = event.tags
              contact.tag_ids = contact.tags.map((a) => a.id)
            }
            this.$VueEvent.fire('contact_updated', contact)
          }
        })
        .listen('.contact.deleted', (event) => {
          let contact = event.contact
          if (contact) {
            if (event.user) {
              contact.user = event.user
            }
            this.$VueEvent.fire('delete_contact', contact)
          }
        })
        .listen('.filter.created', (event) => {
          if (!this.filters.find((o) => {
            return o.id === event.filter.id
          })) {
            this.newFilter(event.filter)
          }
        })
        .listen('.filter.updated', (event) => {
          this.updateFilter(event.filter)
        })
        .listen('.filter.deleted', (event) => {
          if (this.filters.find((o) => {
            return o.id === event.filter.id
          })) {
            this.deleteFilter(event.filter)
          }
        })
        .listen('.user.created', (event) => {
          if (this.currentCompany && event.user.company_id && event.user.company_id === this.currentCompany.id) {
            this.$VueEvent.fire('user_created', event.user)
          }
        })
        .listen('.user.updated', (event) => {
          this.$VueEvent.fire('user_updated', event.user)
        })
        .listen('.user.deleted', (event) => {
          if (this.currentCompany && event.user.company_id && event.user.company_id === this.currentCompany.id) {
            this.$VueEvent.fire('user_deleted', event.user)
          }
        })
        .listen('.workflow.created', (event) => {
          this.newWorkflow(event.workflow)
          this.$VueEvent.fire('workflow_created', event.workflow)
        })
        .listen('.workflow.updated', (event) => {
          let workflow = event.workflow
          this.updateWorkflow(workflow)
          this.$VueEvent.fire('workflow_updated', workflow)
        })
        .listen('.workflow.deleted', (event) => {
          this.deleteWorkflow(event.workflow)
          this.$VueEvent.fire('workflow_deleted', event.workflow)
        })
      window.Echo.join('online-users-company-' + this.profile.company_id)
        // as long as this broadcast will fire, everyone on the presence channel will receive this event
        .listen('.app.newversion', (event) => {
          this.$VueEvent.fire('new_version', event.data.message)
        })
    },
    broadcastLeave () {
      if (this.profile) {
        window.Echo.leave('user-' + this.profile.id)
        window.Echo.leave('company-' + this.profile.company_id)
        window.Echo.leave('online-users-company-' + this.profile.company_id)
        return
      }

      window.Echo.disconnect()
    }
  }
}
