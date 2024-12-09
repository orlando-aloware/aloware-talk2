import Echo from 'laravel-echo'
import _ from 'lodash'
import * as storage from 'src/plugins/helpers/storage'
import { mapActions, mapState } from 'vuex'
import * as ChannelType from 'src/constants/inbox-channels'
import { getWebSocketCredentials } from 'src/boot/helpers'

export default {
  computed: {
    ...mapState('auth', ['profile', 'authenticated']),
    ...mapState('cache', ['currentCompany']),
    ...mapState(['campaigns', 'filters', 'dialer']),
    ...mapState('inbox', [
      'communications',
      'channelChangedFilterFields'
    ])
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
      'newActivityType',
      'deleteActivityType',
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
      const broadcastDriver = this.profile.company.broadcast_driver || 'pusher'

      window.Echo = this.initEcho(broadcastDriver)
      this.broadcastListen()

      // This is a loading test for soketi server second driver
      if (broadcastDriver === 'pusher' && process.env.API_URL !== 'production') {
        window.secondEchoDriver = this.initEcho('soketi')
        this.broadcastListenSecondDriver()
      }

      // If error to connect, try to connect with other driver as fallback
      window.Echo.connector.pusher.connection.bind('error', (err) => {
        // Define the fallback driver, only pusher and soketi exists today
        const fallbackDriver = broadcastDriver === 'pusher' ? 'soketi' : 'pusher'
        console.log('Error to connect to: ' + broadcastDriver, 'Connecting to fallback driver: ' + fallbackDriver, err)

        // Try to connect with fallback driver
        window.Echo = this.initEcho(fallbackDriver)
        this.broadcastListen()
      })
    },
    initEcho (broadcastDriver) {
      console.log('broadcast initiated with ' + broadcastDriver)
      const { WS_APP_KEY, WS_CLUSTER, WS_HOST } = getWebSocketCredentials(broadcastDriver)
      return new Echo({
        authEndpoint: `${process.env.API_URL}/broadcasting/auth`,
        broadcaster: 'pusher',
        key: WS_APP_KEY,
        cluster: WS_CLUSTER,
        wsHost: WS_HOST,
        wssHost: WS_HOST,
        encrypted: true,
        forceTLS: true,
        auth: {
          headers: {
            Authorization: `Bearer ${storage.local.getItem('api_token')}`,
            driver: broadcastDriver
          }
        },
        enabledTransports: ['ws', 'wss'],
        disableStats: true
      })
    },
    broadcastListenSecondDriver () {
      const userId = _.get(this.profile, 'id', null)

      if (!userId) {
        return
      }

      window.secondEchoDriver.private('user-' + userId)
        .listen('.user.status.updated', (event) => {
          console.log('.user.status.updated')
        })
        .listen('.user.in-app.contact.contact_assigned', (event) => {
          console.log('.user.in-app.contact.contact_assigned')
        })
        .listen('.user.in-app.appointment', (event) => {
          console.log('.user.in-app.appointment')
        })
        .listen('.user.in-app.reminder', (event) => {
          console.log('.user.in-app.reminder')
        })
        .listen('.user.in-app.communication.new_call', (event) => {
          console.log('.user.in-app.communication.new_call')
        })
        .listen('.user.desktop.incoming_number.high_sms_volume', (event) => {
          console.log('.user.desktop.incoming_number.high_sms_volume')
        })
        .listen('.user.in-app.communication.answered_call', (event) => {
          console.log('.user.in-app.communication.answered_call')
        })
        .listen('.user.in-app.communication.new_sms', (event) => {
          console.log('.user.in-app.communication.new_sms')
        })
        .listen('.user.in-app.communication.new_voicemail', (event) => {
          console.log('.user.in-app.communication.new_voicemail')
        })
        .listen('.user.in-app.communication.new_fax', (event) => {
          console.log('.user.in-app.communication.new_fax')
        })
        .listen('.user.desktop.contact.contact_assigned', (event) => {
          console.log('.user.desktop.contact.contact_assigned')
        })
        .listen('.user.desktop.appointment', (event) => {
          console.log('.user.desktop.appointment')
        })
        .listen('.user.desktop.reminder', (event) => {
          console.log('.user.desktop.reminder')
        })
        .listen('.user.desktop.communication.new_call', (event) => {
          console.log('.user.desktop.communication.new_call')
        })
        .listen('.user.desktop.communication.answered_call', (event) => {
          console.log('.user.desktop.communication.answered_call')
        })
        .listen('.user.desktop.communication.new_sms', (event) => {
          console.log('.user.desktop.communication.new_sms')
        })
        .listen('.user.desktop.communication.new_voicemail', (event) => {
          console.log('.user.desktop.communication.new_voicemail')
        })
        .listen('.user.desktop.communication.new_fax', (event) => {
          console.log('.user.desktop.communication.new_fax')
        })
        .listen('.user.logout', (event) => {
          console.log('.user.logout')
        })
        .listen('.communication.created', (event) => {
          console.log('.communication.created')
        })
        .listen('.communication.updated', (event) => {
          console.log('.communication.updated')
        })
        .listen('.user.contact_list_item.created', (event) => {
          console.log('.user.contact_list_item.created')
        })
        .listen('.user.contact_list_item.updated', (event) => {
          console.log('.user.contact_list_item.updated')
        })
        .listen('.user.contact_list_item.deleting', (event) => {
          console.log('.user.contact_list_item.deleting')
        })
        .listen('.user.session_metrics_calculation', (event) => {
          console.log('.user.session_metrics_calculation')
        })
        .listen('.bulk_contact_list_items.created', (event) => {
          console.log('.bulk_contact_list_items.created')
        })
        .listen('.bulk_contact_list_items.deleted', (event) => {
          console.log('.bulk_contact_list_items.deleted')
        })
        .listen('.bulk_contacts.deleted', (event) => {
          console.log('.bulk_contacts.deleted')
        })
        .listen('.export-events', (event) => {
          console.log('.export-events')
        })
        .listen('.bulk_tags.deleted', (event) => {
          console.log('.bulk_tags.deleted')
        })
        .listen('.power_dialer_contact.removed', (event) => {
          console.log('.power_dialer_contact.removed')
        })

      window.secondEchoDriver.private('company-' + this.profile.company_id)
        .listen('.company.updated', (event) => {
          console.log('.company.updated')
        })
        .listen('.communication.created', (event) => {
          console.log('.communication.created')
        })
        .listen('.communication.updated', (event) => {
          console.log('.communication.updated')
        })
        .listen('.communication.deleted', (event) => {
          console.log('.communication.deleted')
        })
        .listen('.incoming_number.created', (event) => {
          console.log('.incoming_number.created')
        })
        .listen('.ring_group.created', (event) => {
          console.log('.ring_group.created')
        })
        .listen('.ring_group.updated', (event) => {
          console.log('.ring_group.updated')
        })
        .listen('.ring_group.deleted', (event) => {
          console.log('.ring_group.deleted')
        })
        .listen('.campaign.created', (event) => {
          console.log('.campaign.created')
        })
        .listen('.campaign.updated', (event) => {
          console.log('.campaign.updated')
        })
        .listen('.campaign.deleted', (event) => {
          console.log('.campaign.deleted')
        })
        .listen('.tag.created', (event) => {
          console.log('.tag.created')
        })
        .listen('.tag.updated', (event) => {
          console.log('.tag.updated')
        })
        .listen('.tag.deleting', (event) => {
          console.log('.tag.deleting')
        })
        .listen('.disposition_status.created', (event) => {
          console.log('.disposition_status.created')
        })
        .listen('.disposition_status.updated', (event) => {
          console.log('.disposition_status.updated')
        })
        .listen('.disposition_status.deleted', (event) => {
          console.log('.disposition_status.deleted')
        })
        .listen('.call_disposition.bulk_created', (event) => {
          console.log('.call_disposition.bulk_created')
        })
        .listen('.call_disposition.created', (event) => {
          console.log('.call_disposition.created')
        })
        .listen('.call_disposition.updated', (event) => {
          console.log('.call_disposition.updated')
        })
        .listen('.call_disposition.deleted', (event) => {
          console.log('.call_disposition.deleted')
        })
        .listen('.activity_type.created', (event) => {
          console.log('.activity_type.created')
        })
        .listen('.activity_type.deleted', (event) => {
          console.log('.activity_type.deleted')
        })
        .listen('.contact.created', (event) => {
          console.log('.contact.created')
        })
        .listen('.contact.updated', (event) => {
          console.log('.contact.updated')
        })
        .listen('.contact.deleted', (event) => {
          console.log('.contact.deleted')
        })
        .listen('.contact_audit.created', (event) => {
          console.log('.contact_audit.created')
        })
        .listen('.filter.created', (event) => {
          console.log('.filter.created')
        })
        .listen('.filter.updated', (event) => {
          console.log('.filter.updated')
        })
        .listen('.filter.deleted', (event) => {
          console.log('.filter.deleted')
        })
        .listen('.user.created', (event) => {
          console.log('.user.created')
        })
        .listen('.user.updated', (event) => {
          console.log('.user.updated')
        })
        .listen('.user.deleted', (event) => {
          console.log('.user.deleted')
        })
        .listen('.workflow.created', (event) => {
          console.log('.workflow.created')
        })
        .listen('.workflow.updated', (event) => {
          console.log('.workflow.updated')
        })
        .listen('.workflow.deleted', (event) => {
          console.log('.workflow.deleted')
        })
        .listen('.export-events', (event) => {
          console.log('.export-events')
        })
        .listen('.export.created', (event) => {
          console.log('.export.created')
        })
        .listen('.export.updated', (event) => {
          console.log('.export.updated')
        })
        .listen('.export.deleted', (event) => {
          console.log('.export.deleted')
        })
        .listen('.contact-list.import-hubspot', (event) => {
          console.log('.contact-list.import-hubspot')
        })
        .listen('.contact-list.import-zoho', (event) => {
          console.log('.contact-list.import-zoho')
        })
        .listen('.contact-list.import-pipedrive', (event) => {
          console.log('.contact-list.import-pipedrive')
        })
        .listen('.contact-list.import-failed', (event) => {
          console.log('.contact-list.import-failed')
        })
        .listen('.contact-list.created', (event) => {
          console.log('.contact-list.created')
        })
        .listen('.broadcasts.created', (event) => {
          console.log('.broadcasts.created')
        })
        .listen('.broadcasts.updated', (event) => {
          console.log('.broadcasts.updated')
        })
        .listen('.broadcasts.deleted', (event) => {
          console.log('.broadcasts.deleted')
        })
        .listen('.script.deleted', (event) => {
          console.log('.script.deleted')
        })
        .listen('.kyc_status_updated', (event) => {
          console.log('.kyc_status_updated')
        })

      window.secondEchoDriver.private('cache-agent-status-user-' + userId)
        .listen('.agent_status.updated', (event) => {
          console.log('.agent_status.updated')
        })
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
            console.log('.user.in-app.communication.new_call - event.communication', event.communication)
            this.$VueEvent.fire('new_in_app_call', event.communication)
          }
        })
        .listen('.user.desktop.incoming_number.high_sms_volume', (event) => {
          const incomingNumber = event.incoming_number
          const contact = event.contact
          const direction = event.direction
          this.$VueEvent.fire('desktop_high_sms_volume', { incomingNumber, contact, direction })
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
            console.log('.user.desktop.communication.new_call - event.communication', event.communication)
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
        .listen('.user.logout', (event) => {
          this.$VueEvent.fire('user_logout', event)
        })
        .listen('.communication.created', (event) => {
          if (event.tags) {
            event.communication.tags = event.tags
            event.communication.tag_ids = event.communication.tags.map((a) => a.id)
          }
          if (event.contact) {
            event.communication.contact = event.contact

            if (event.contact_tags) {
              event.communication.contact.tags = event.contact_tags
            }
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

            if (event.contact_tags) {
              event.communication.contact.tags = event.contact_tags
            }
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
        .listen('.bulk_contact_list_items.deleted', (event) => {
          window.VueEvent.fire('contact_list_bulk_deleted', event)
        })
        .listen('.bulk_contacts.deleted', (event) => {
          window.VueEvent.fire('contacts_bulk_deleted', event)
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
        .listen('.power_dialer_contact.removed', event => {
          window.VueEvent.fire('power_dialer_contact_removed', event.contact_id)
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

            if (event.contact_tags) {
              event.communication.contact.tags = event.contact_tags
            }
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

            if (event.contact_tags) {
              event.communication.contact.tags = event.contact_tags
            }
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
        .listen('.activity_type.created', (event) => {
          this.newActivityType(event.activity_type)
          this.$VueEvent.fire('activity_type_created', event.activity_type)
        })
        .listen('.activity_type.deleted', (event) => {
          this.deleteActivityType(event.activity_type)
          this.$VueEvent.fire('activity_type_deleted', event.activity_type)
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
            if (this.channelChangedFilterFields) {
              event.contact.communications = this.communications
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
          // for Inbox Filter Types
          if (event.filter.type === ChannelType.CHANNEL_INBOX) {
            this.$VueEvent.fire('filter_deleted', event.filter)
          }

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
        .listen('.contact-list.created', (event) => {
          if (this.profile && event.user_id && event.user_id === this.profile.id) {
            window.VueEvent.fire('contact_list_created', event)
          }
        })
        .listen('.broadcasts.created', (event) => {
          window.VueEvent.fire('broadcasts_created', event.broadcaster)
        })
        .listen('.broadcasts.updated', (event) => {
          window.VueEvent.fire('broadcasts_updated', event.broadcaster)
        })
        .listen('.broadcasts.deleted', (event) => {
          window.VueEvent.fire('broadcasts_deleted', event.broadcaster)
        })
        .listen('.script.deleted', (event) => {
          window.VueEvent.fire('script_deleted', event.script)
        })
        .listen('.kyc_status_updated', (event) => {
          const sameCompany = this.currentCompany && this.currentCompany.id === event.company.id
          if (sameCompany) {
            setInterval(() => {
              // check if there is a current call in progress
              if (!['MAKING_CALL', 'CALL_CONNECTED'].includes(this.dialer.currentStatus)) {
                this.setCurrentCompany(event.company)
                this.$VueEvent.fire('kyc_status_updated', event.company)
              }
            }, 10000)
          }
        })

      window.Echo.private('cache-agent-status-user-' + userId)
        .listen('.agent_status.updated', (event) => {
          // make sure this occurs only for the logged user
          if (!this.profile || !event.user_id || this.profile.id !== event.user_id) {
            return
          }
          this.$VueEvent.fire('agent_status_updated', event)
        })
    },
    broadcastLeave () {
      if (!window.Echo) {
        return
      }

      if (window.secondEchoDriver) {
        window.secondEchoDriver.disconnect()
      }

      if (this.profile) {
        window.Echo.leave('user-' + this.profile.id)
        window.Echo.leave('company-' + this.profile.company_id)
        window.Echo.leave('cache-agent-status-' + this.profile.company_id)
        return
      }

      window.Echo.disconnect()
    }
  }
}
