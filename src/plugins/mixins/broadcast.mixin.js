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
      const broadcastDriver = this.currentCompany?.broadcast_driver || 'pusher'

      window.Echo = this.initEcho(broadcastDriver)
      this.broadcastListen()

      // This is a stress test for soketi server, should be removed in the future
      if (broadcastDriver === 'pusher') {
        window.secondEchoDriver = this.initEcho('soketi')
        this.broadcastListenSecondDriver()
      }

      // If error to connect, try to connect with other driver as fallback
      window.Echo.connector.pusher.connection.unbind('error')
      window.Echo.connector.pusher.connection.bind('error', (err) => {
        console.error('Error to connect to ws driver', err)
        if (window.fallbackDriver) {
          console.log('Fallback driver already started', window.fallbackDriver)
          return
        }
        // Define the fallback driver, only pusher and soketi exists today
        window.fallbackDriver = broadcastDriver === 'pusher' ? 'soketi' : 'pusher'
        console.log('Error to connect to: ' + broadcastDriver, 'Connecting to fallback driver: ' + window.fallbackDriver, err)

        // Try to connect with fallback driver
        window.Echo = this.initEcho(window.fallbackDriver)
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

      const userEvents = [
        '.user.status.updated',
        '.user.in-app.contact.contact_assigned',
        '.user.in-app.appointment',
        '.user.in-app.reminder',
        '.user.in-app.communication.new_call',
        '.user.desktop.incoming_number.high_sms_volume',
        '.user.in-app.communication.answered_call',
        '.user.in-app.communication.new_sms',
        '.user.in-app.communication.new_voicemail',
        '.user.in-app.communication.new_fax',
        '.user.desktop.contact.contact_assigned',
        '.user.desktop.appointment',
        '.user.desktop.reminder',
        '.user.desktop.communication.new_call',
        '.user.desktop.communication.answered_call',
        '.user.desktop.communication.new_sms',
        '.user.desktop.communication.new_voicemail',
        '.user.desktop.communication.new_fax',
        '.user.logout',
        '.communication.created',
        '.communication.updated',
        '.user.contact_list_item.created',
        '.user.contact_list_item.updated',
        '.user.contact_list_item.deleting',
        '.user.session_metrics_calculation',
        '.bulk_contact_list_items.created',
        '.bulk_contact_list_items.deleted',
        '.bulk_contacts.deleted',
        '.export-events',
        '.bulk_tags.deleted',
        '.power_dialer_contact.removed'
      ]

      const companyEvents = [
        '.company.updated',
        '.communication.created',
        '.communication.updated',
        '.communication.deleted',
        '.incoming_number.created',
        '.ring_group.created',
        '.ring_group.updated',
        '.ring_group.deleted',
        '.campaign.created',
        '.campaign.updated',
        '.campaign.deleted',
        '.tag.created',
        '.tag.updated',
        '.tag.deleting',
        '.disposition_status.created',
        '.disposition_status.updated',
        '.disposition_status.deleted',
        '.call_disposition.bulk_created',
        '.call_disposition.created',
        '.call_disposition.updated',
        '.call_disposition.deleted',
        '.activity_type.created',
        '.activity_type.deleted',
        '.contact.created',
        '.contact.updated',
        '.contact.deleted',
        '.contact_audit.created',
        '.filter.created',
        '.filter.updated',
        '.filter.deleted',
        '.user.created',
        '.user.updated',
        '.user.deleted',
        '.workflow.created',
        '.workflow.updated',
        '.workflow.deleted',
        '.export-events',
        '.export.created',
        '.export.updated',
        '.export.deleted',
        '.contact-list.import-hubspot',
        '.contact-list.import-zoho',
        '.contact-list.import-pipedrive',
        '.contact-list.import-failed',
        '.contact-list.created',
        '.broadcasts.created',
        '.broadcasts.updated',
        '.broadcasts.deleted',
        '.script.deleted',
        '.kyc_status_updated'
      ]

      userEvents.forEach(event => {
        window.secondEchoDriver.private('user-' + userId).listen(event, (event) => {})
      })

      companyEvents.forEach(event => {
        window.secondEchoDriver.private('company-' + this.profile.company_id).listen(event, (event) => {})
      })

      window.secondEchoDriver.private('cache-agent-status-user-' + userId).listen('.agent_status.updated', (event) => {})
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
          console.log('### Updated call_summary:', event?.communication?.call_summary)
          console.log('### Updated call_transcription_status:', event?.communication?.call_transcription_status)
          console.log('Updated call_summary_status:', event?.communication.call_summary_status)
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
          console.log('>>> Updated call_summary:', event?.communication?.call_summary)
          console.log('>>> Updated call_transcription_status:', event?.communication?.call_transcription_status)
          console.log('>>> Updated call_summary_status:', event?.communication.call_summary_status)
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
