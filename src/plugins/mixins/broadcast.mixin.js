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
      'newRingGroup',
      'updateRingGroup',
      'deleteRingGroup',
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
        forceTLS: true,
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
      const userId = _.get(this.profile, 'id', null)

      if (!userId) {
        return
      }

      window.Echo.private('user-' + userId)
        .listen('.user.status.updated', (event) => {
          this.setUserStatus(event.status)
        })
        .listen('.user.in-app.contact.contact_assigned', (event) => {
          if (event.tags) {
            event.contact.tags = event.tags
            event.contact.tag_ids = event.contact.tags.map((a) => a.id)
          }
          if (event.user) {
            event.contact.user = event.user
          }
          this.$VueEvent.fire('new_in_app_contact_assigned', event.contact)
        })
        .listen('.user.in-app.appointment', (event) => {
          this.$VueEvent.fire('new_in_app_appointment', {
            engagement: event.engagement,
            contact: event.contact,
            timeDiff: event.time_diff,
            unit: event.unit
          })
        })
        .listen('.user.in-app.reminder', (event) => {
          this.$VueEvent.fire('new_in_app_reminder', {
            engagement: event.engagement,
            contact: event.contact,
            timeDiff: event.timeDiff,
            unit: event.unit
          })
        })
        .listen('.user.in-app.communication.new_call', (event) => {
          const campaign = this.campaigns.find(campaign => campaign.id === event.communication.campaign_id)
          if (campaign) {
            event.communication.campaign = campaign
            if (event.tags) {
              event.communication.tags = event.tags
              event.communication.tag_ids = event.communication.tags.map((a) => a.id)
            }
            if (event.contact) {
              event.communication.contact = event.contact
            }
            if (event.contact_tags && event.communication && event.communication.contact) {
              event.communication.contact.tags = event.contact_tags
            }
            if (event.owner) {
              event.communication.owner = event.owner
            }
            this.$VueEvent.fire('new_in_app_call', event.communication)
          }
        })
        .listen('.user.in-app.communication.answered_call', (event) => {
          const campaign = this.campaigns.find(campaign => campaign.id === event.communication.campaign_id)
          if (campaign) {
            event.communication.campaign = campaign
            if (event.tags) {
              event.communication.tags = event.tags
              event.communication.tag_ids = event.communication.tags.map((a) => a.id)
            }
            if (event.contact) {
              event.communication.contact = event.contact
            }
            if (event.contact_tags && event.communication && event.communication.contact) {
              event.communication.contact.tags = event.contact_tags
            }
            if (event.owner) {
              event.communication.owner = event.owner
            }
            this.$VueEvent.fire('answered_in_app_call', event.communication)
          }
        })
        .listen('.user.in-app.communication.new_sms', (event) => {
          const campaign = this.campaigns.find(campaign => campaign.id === event.communication.campaign_id)
          if (campaign) {
            event.communication.campaign = campaign
            if (event.tags) {
              event.communication.tags = event.tags
              event.communication.tag_ids = event.communication.tags.map((a) => a.id)
            }
            if (event.contact) {
              event.communication.contact = event.contact
            }
            if (event.contact_tags && event.communication && event.communication.contact) {
              event.communication.contact.tags = event.contact_tags
            }
            if (event.owner) {
              event.communication.owner = event.owner
            }
            this.$VueEvent.fire('new_in_app_sms', event.communication)
          }
        })
        .listen('.user.in-app.communication.new_voicemail', (event) => {
          const campaign = this.campaigns.find(campaign => campaign.id === event.communication.campaign_id)
          if (campaign) {
            event.communication.campaign = campaign
            if (event.tags) {
              event.communication.tags = event.tags
              event.communication.tag_ids = event.tags.map((a) => a.id)
            }
            if (event.contact) {
              event.communication.contact = event.contact
            }
            if (event.contact_tags && event.communication && event.communication.contact) {
              event.communication.contact.tags = event.contact_tags
            }
            if (event.owner) {
              event.communication.owner = event.owner
            }
            this.$VueEvent.fire('new_in_app_voicemail', event.communication)
          }
        })
        .listen('.user.in-app.communication.new_fax', (event) => {
          const campaign = this.campaigns.find(campaign => campaign.id === event.communication.campaign_id)
          if (campaign) {
            event.communication.campaign = campaign
            if (event.tags) {
              event.communication.tags = event.tags
              event.communication.tag_ids = event.communication.tags.map((a) => a.id)
            }
            if (event.contact) {
              event.communication.contact = event.contact
            }
            if (event.contact_tags && event.communication && event.communication.contact) {
              event.communication.contact.tags = event.contact_tags
            }
            if (event.owner) {
              event.communication.owner = event.owner
            }
            this.$VueEvent.fire('new_in_app_fax', event.communication)
          }
        })
        .listen('.user.desktop.contact.contact_assigned', (event) => {
          if (event.tags) {
            event.contact.tags = event.tags
            event.contact.tag_ids = event.contact.tags.map((a) => a.id)
          }
          if (event.user) {
            event.contact.user = event.user
          }
          this.$VueEvent.fire('new_desktop_contact_assigned', event.contact)
        })
        .listen('.user.desktop.appointment', (event) => {
          this.$VueEvent.fire('new_desktop_appointment', {
            engagement: event.engagement,
            contact: event.contact,
            timeDiff: event.timeDiff,
            unit: event.unit
          })
        })
        .listen('.user.desktop.reminder', (event) => {
          this.$VueEvent.fire('new_desktop_reminder', {
            engagement: event.engagement,
            contact: event.contact,
            timeDiff: event.timeDiff,
            unit: event.unit
          })
        })
        .listen('.user.desktop.communication.new_call', (event) => {
          const campaign = this.campaigns.find(campaign => campaign.id === event.communication.campaign_id)
          if (campaign) {
            event.communication.campaign = campaign
            if (event.tags) {
              event.communication.tags = event.tags
              event.communication.tag_ids = event.tags.map((a) => a.id)
            }
            if (event.contact) {
              event.communication.contact = event.contact
            }
            if (event.contact_tags) {
              event.communication.contact.tags = event.contact_tags
            }
            if (event.owner) {
              event.communication.owner = event.owner
            }
            this.$VueEvent.fire('new_desktop_call', event.communication)
          }
        })
        .listen('.user.desktop.communication.answered_call', (event) => {
          const campaign = this.campaigns.find(campaign => campaign.id === event.communication.campaign_id)
          if (campaign) {
            event.communication.campaign = campaign
            if (event.tags) {
              event.communication.tags = event.tags
              event.communication.tag_ids = event.tags.map((a) => a.id)
            }
            if (event.contact) {
              event.communication.contact = event.contact
            }
            if (event.contact_tags) {
              event.communication.contact.tags = event.contact_tags
            }
            if (event.owner) {
              event.communication.owner = event.owner
            }
            this.$VueEvent.fire('new_answered_call', event.communication)
          }
        })
        .listen('.user.desktop.communication.new_sms', (event) => {
          const campaign = this.campaigns.find(campaign => campaign.id === event.communication.campaign_id)
          if (campaign) {
            event.communication.campaign = campaign
            if (event.tags) {
              event.communication.tags = event.tags
              event.communication.tag_ids = event.tags.map((a) => a.id)
            }
            if (event.contact) {
              event.communication.contact = event.contact
            }
            if (event.contact_tags) {
              event.communication.contact.tags = event.contact_tags
            }
            if (event.owner) {
              event.communication.owner = event.owner
            }
            this.$VueEvent.fire('new_desktop_sms', event.communication)
          }
        })
        .listen('.user.desktop.communication.new_voicemail', (event) => {
          const campaign = this.campaigns.find(campaign => campaign.id === event.communication.campaign_id)
          if (campaign) {
            event.communication.campaign = campaign
            if (event.tags) {
              event.communication.tags = event.tags
              event.communication.tag_ids = event.tags.map((a) => a.id)
            }
            if (event.contact) {
              event.communication.contact = event.contact
            }
            if (event.contact_tags) {
              event.communication.contact.tags = event.contact_tags
            }
            if (event.owner) {
              event.communication.owner = event.owner
            }
            this.$VueEvent.fire('new_desktop_voicemail', event.communication)
          }
        })
        .listen('.user.desktop.communication.new_fax', (event) => {
          const campaign = this.campaigns.find(campaign => campaign.id === event.communication.campaign_id)
          if (campaign) {
            event.communication.campaign = campaign
            if (event.tags) {
              event.communication.tags = event.tags
              event.communication.tag_ids = event.tags.map((a) => a.id)
            }
            if (event.contact) {
              event.communication.contact = event.contact
            }
            if (event.contact_tags) {
              event.communication.contact.tags = event.contact_tags
            }
            if (event.owner) {
              event.communication.owner = event.owner
            }
            this.$VueEvent.fire('new_desktop_fax', event.communication)
          }
        })
        .listen('.user.logout', () => {
          this.$VueEvent.fire('user_logout')
        })

        /**
         * ------------------------------------
         * Power Dialer Session Tasks
         * ------------------------------------
         */
        .listen('.user.contact_list_item.created', (event) => {
          window.VueEvent.fire('contact_list_item_created', event.contact_list_item)
        })
        .listen('.user.contact_list_item.updated', (event) => {
          window.VueEvent.fire('contact_list_item_updated', event.contact_list_item)
        })
        .listen('.user.contact_list_item.deleting', (event) => {
          window.VueEvent.fire('contact_list_item_deleting', event.contact_list_item)
        })
        .listen('.user.session_metrics_calculation', (event) => {
          window.VueEvent.fire('metric_sessions_update', event)
        })
        .listen('.bulk_contact_list_items.created', (event) => {
          window.VueEvent.fire('contact_list_bulk_created', event)
        })
        .listen('.export-events', (event) => {
          window.VueEvent.fire('export_event_updates', event)
        })
        .listen('.bulk_contacts.deleted', (event) => {
          window.VueEvent.fire('bulk_contacts_deleted', event)
        })
        .listen('.bulk_tags.deleted', (event) => {
          window.VueEvent.fire('bulk_tags_deleted', event)
        })
        // .listen('.export.created', (event) => {
        //   console.log('created export event :>> ', event)
        //   window.VueEvent.fire('export_event_updates', event)
        // })
        // .listen('.export.updated', (event) => {
        //   console.log('updated export event :>> ', event)
        //   window.VueEvent.fire('export_event_updates', event)
        // })
        // .listen('.export.deleted', (event) => {
        //   console.log('deleted export event :>> ', event)
        //   window.VueEvent.fire('export_event_updates', event)
        // })
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
            this.$VueEvent.fire('company_updated', event.company)
          }
        })
        .listen('.communication.created', (event) => {
          if (event.tags) {
            event.communication.tags = event.tags
            event.communication.tag_ids = event.communication.tags.map((a) => a.id)
          }
          if (event.contact) {
            event.communication.contact = event.contact
          }
          if (event.owner) {
            event.communication.owner = event.owner
          }
          const campaign = this.campaigns.find(campaign => campaign.id === event.communication.campaign_id)
          if (campaign) {
            event.communication.campaign = campaign
          }
          this.$VueEvent.fire('new_communication', event.communication)
        })
        .listen('.communication.updated', (event) => {
          if (event.tags) {
            event.communication.tags = event.tags
            event.communication.tag_ids = event.communication.tags.map((a) => a.id)
          }
          if (event.contact) {
            event.communication.contact = event.contact
          }
          if (event.owner) {
            event.communication.owner = event.owner
          }
          const campaign = this.campaigns.find(campaign => campaign.id === event.communication.campaign_id)
          if (campaign) {
            event.communication.campaign = campaign
          }
          this.$VueEvent.fire('update_communication', event.communication)
        })
        .listen('.communication.deleted', (event) => {
          this.$VueEvent.fire('delete_communication', event.communication)
        })
        .listen('.incoming_number.created', (event) => {
          const campaign = this.campaigns.find(campaign => campaign.id === event.incoming_number.campaign_id)
          if (campaign) {
            campaign.incoming_number = event.incoming_number.phone_number
            this.updateCampaign(campaign)
          }
        })
        .listen('.ring_group.created', (event) => {
          this.newRingGroup(event.ring_group)
          this.$VueEvent.fire('ring_group_created', event.ring_group)
        })
        .listen('.ring_group.updated', (event) => {
          this.updateRingGroup(event.ring_group)
          this.$VueEvent.fire('ring_group_updated', event.ring_group)
        })
        .listen('.ring_group.deleted', (event) => {
          this.deleteRingGroup(event.ring_group)
          this.$VueEvent.fire('ring_group_deleted', event.ring_group)
        })
        .listen('.campaign.created', (event) => {
          event.campaign.last_call_datetime = event.last_call_datetime
          this.newCampaign(event.campaign)
          this.$VueEvent.fire('campaign_created', event.campaign)
        })
        .listen('.campaign.updated', (event) => {
          event.campaign.last_call_datetime = event.last_call_datetime
          this.updateCampaign(event.campaign)
          this.$VueEvent.fire('campaign_updated', event.campaign)
        })
        .listen('.campaign.deleted', (event) => {
          this.deleteCampaign(event.campaign)
          this.$VueEvent.fire('campaign_deleted', event.campaign)
        })
        .listen('.tag.created', (event) => {
          this.newTag(event.tag)
          this.$VueEvent.fire('tag_created', event.tag)
        })
        .listen('.tag.updated', (event) => {
          if (event.tag.name.includes('_deleted_')) {
            return
          }

          this.updateTag(event.tag)
          this.$VueEvent.fire('tag_updated', event.tag)
        })
        .listen('.tag.deleting', (event) => {
          this.deleteTag(event.tag)
          this.$VueEvent.fire('tag_deleting', event.tag)
        })
        .listen('.disposition_status.created', (event) => {
          this.newDispositionStatus(event.disposition_status)
          this.$VueEvent.fire('disposition_status_created', event.disposition_status)
        })
        .listen('.disposition_status.updated', (event) => {
          this.updateDispositionStatus(event.disposition_status)
          this.$VueEvent.fire('disposition_status_updated', event.disposition_status)
        })
        .listen('.disposition_status.deleted', (event) => {
          this.deleteDispositionStatus(event.disposition_status)
          this.$VueEvent.fire('disposition_status_deleted', event.disposition_status)
        })
        .listen('.call_disposition.bulk_created', (event) => {
          this.newBulkCallDisposition(event.call_dispositions)
          this.$VueEvent.fire('call_disposition_bulk_created', event.call_dispositions)
        })
        .listen('.call_disposition.created', (event) => {
          this.newCallDisposition(event.call_disposition)
          this.$VueEvent.fire('call_disposition_created', event.call_disposition)
        })
        .listen('.call_disposition.updated', (event) => {
          this.updateCallDisposition(event.call_disposition)
          this.$VueEvent.fire('call_disposition_updated', event.call_disposition)
        })
        .listen('.call_disposition.deleted', (event) => {
          this.deleteCallDisposition(event.call_disposition)
          this.$VueEvent.fire('call_disposition_deleted', event.call_disposition)
        })
        .listen('.contact.created', (event) => {
          if (event.contact) {
            if (event.user) {
              event.contact.user = event.user
            }
            if (event.tags) {
              event.contact.tags = event.tags
              event.contact.tag_ids = event.contact.tags.map((a) => a.id)
            }
            this.$VueEvent.fire('contact_created', event.contact)
          }
        })
        .listen('.contact.updated', (event) => {
          if (event.contact) {
            if (event.user) {
              event.contact.user = event.user
            }
            if (event.tags) {
              event.contact.tags = event.tags
              event.contact.tag_ids = event.contact.tags.map((a) => a.id)
            }
            this.$VueEvent.fire('contact_updated', event.contact)
          }
        })
        .listen('.contact.deleted', (event) => {
          if (event.contact) {
            if (event.user) {
              event.contact.user = event.user
            }
            this.$VueEvent.fire('delete_contact', event.contact)
          }
        })
        .listen('.contact_audit.created', (event) => {
          let contactAudit = event.audit
          if (contactAudit) {
            this.$VueEvent.fire('contact_audit_created', contactAudit)
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
          this.updateWorkflow(event.workflow)
          this.$VueEvent.fire('workflow_updated', event.workflow)
        })
        .listen('.workflow.deleted', (event) => {
          this.deleteWorkflow(event.workflow)
          this.$VueEvent.fire('workflow_deleted', event.workflow)
        })
        .listen('.export-events', (event) => {
          window.VueEvent.fire('export_event_updates', event)
        })
        .listen('.export.created', (event) => {
          window.VueEvent.fire('export_event_create', event)
        })
        .listen('.export.updated', (event) => {
          window.VueEvent.fire('export_event_update', event)
        })
        .listen('.export.deleted', (event) => {
          window.VueEvent.fire('export_event_delete', event)
        })
        .listen('.contact-list.import-hubspot', (event) => {
          window.VueEvent.fire('contact_list_import_hubspot', event)
        })
        .listen('.contact-list.import-zoho', (event) => {
          window.VueEvent.fire('contact_list_import_zoho', event)
        })
        .listen('.contact-list.import-pipedrive', (event) => {
          window.VueEvent.fire('contact_list_import_pipedrive', event)
        })
        .listen('.contact-list.import-failed', (event) => {
          window.VueEvent.fire('contact_list_import_failed', event)
        })

      window.Echo.join('online-users-company-' + this.profile.company_id)
        // as long as this broadcast will fire, everyone on the presence channel will receive this event
        .listen('.app.newversion', (event) => {
          this.$VueEvent.fire('new_version', event.data.message)
        })
        .listen('.communication.created', (event) => {
          if (event.tags) {
            event.communication.tags = event.tags
            event.communication.tag_ids = event.communication.tags.map((a) => a.id)
          }
          if (event.contact) {
            event.communication.contact = event.contact
          }
          if (event.owner) {
            event.communication.owner = event.owner
          }
          const campaign = this.campaigns.find(campaign => campaign.id === event.communication.campaign_id)
          if (campaign) {
            event.communication.campaign = campaign
          }
          this.$VueEvent.fire('new_communication', event.communication)
        })
        .listen('.communication.updated', (event) => {
          if (event.tags) {
            event.communication.tags = event.tags
            event.communication.tag_ids = event.communication.tags.map((a) => a.id)
          }
          if (event.contact) {
            event.communication.contact = event.contact
          }
          if (event.owner) {
            event.communication.owner = event.owner
          }
          const campaign = this.campaigns.find(campaign => campaign.id === event.communication.campaign_id)
          if (campaign) {
            event.communication.campaign = campaign
          }
          this.$VueEvent.fire('update_communication', event.communication)
        })
        .listen('.communication.deleted', (event) => {
          this.$VueEvent.fire('delete_communication', event.communication)
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

      window.Echo.private('cache-agent-status-' + this.profile.company_id)
        .listen('.agent_status.updated', (event) => {
          if (!this.profile || !event.user_id) {
            return
          }
          this.$VueEvent.fire('agent_status_updated', event)
        })
    },
    broadcastLeave () {
      if (!window.Echo) {
        return
      }

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
