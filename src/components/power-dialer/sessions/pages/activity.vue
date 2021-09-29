<template>
  <div class="row">
    <div class="col-12 p-1">
      <!-- <q-card flat class="p-3">
        <q-card-section class="p-0">
          <div class="text-subtitle1 text-weight-medium">Juan Dela Cruz</div>
        </q-card-section>
      </q-card> -->
      <div :class="`contact-activity-wrapper ${widthClass}`">
        <ContactActivities
          ref="contactActivities"
          :communications="communications"
          :campaign-id="selectedId"
          @mark-all-as-read="markAllAsRead">
          <template v-slot:moreActivities>
            fd
          </template>
        </ContactActivities>
      </div>
    </div>
  </div>
</template>

<script>

import { mapGetters, mapActions } from 'vuex'
import contactMixins from 'src/plugins/mixins/contact.mixin'
import ContactActivities from 'src/components/contacts/contact-activities'

export default {
  name: 'SessionPageActivity',
  components: {
    ContactActivities
  },
  mixins: [
    contactMixins
  ],
  mounted () {
    if (this.authenticated) {
      this.fetchContact()
    }
  },
  computed: {
    ...mapGetters('auth', ['authenticated']),
    widthClass () {
      if (this.isInbox) {
        return 'w-less-330px'
      }
      return '500px'
      // !this.isSidebarCollapsed ? 'w-less-630px' : 'w-less-345px'
    }
  },
  methods: {
    ...mapActions('contacts', [
      'resetChangedContactProperties',
      'selectedContactChanging',
      'setContact',
      'setContactClone'
    ]),
    fetchContact () {
      this.selectedContactChanging(true)
      let _this = this
      this.processFetchContactInfo(function (selectedContact) {
        _this.setContact(selectedContact)
        _this.setContactClone(selectedContact)
        _this.resetChangedContactProperties([])
        _this.selectedContactChanging(false)
      })
    },
    markAllAsRead2 () {
      console.log('888 :>> ', 888)
    }
  },
  data () {
    return {
      selectedId: {
        'id': 10,
        'company_id': 7,
        'ring_group_id': null,
        'ivr_text_ring_group_id': null,
        'user_id': 6,
        'default_filter_id': null,
        'name': 'Vulcan Hotel',
        'description': null,
        'should_greet': true,
        'greeting_tts': 'Welcome to Aloware',
        'greeting_file': null,
        'should_ask_for_text_authorization': false,
        'ask_for_text_authorization_tts': 'Press 1 for text message authorization.',
        'ask_for_text_authorization_file': null,
        'should_whisper': true,
        'whisper_tts': 'Hey [AgentName] This is a call from [CampaignName]!',
        'whisper_file': null,
        'should_record': true,
        'record_tts': 'Your call is being recorded for quality assurance purposes.',
        'record_file': null,
        'voicemail_tts': 'We are sorry, but no agents are available to take this call. Please leave your message after the beep.',
        'voicemail_file': null,
        'review_required': 1,
        'review_duration': 60,
        'is_proxy': 0,
        'caller_id_option': 1,
        'missed_call_handling_mode': 2,
        'missed_call_handling_options': '{"forward_to": "+18189005934", "reroute_to_campaign_id": null}',
        'call_router_behavior': 1,
        'ivr_prompt_tts': 'If you know your extension you can enter it now, if not Press 1 to connect to GoSite.',
        'ivr_prompt_file': null,
        'should_message_if_missed': false,
        'missed_call_message': null,
        'should_block_spam': false,
        'created_at': '2018-02-02 04: 37: 23',
        'updated_at': '2021-09-02 21: 59: 54',
        'type': 0,
        'subtype': null,
        'is_fax': false,
        'operating_hours': '{"friday": [{"id": "5", "open": "24hrs", "close": "24hrs", "isOpen": true}], "monday": [{"id": "1", "open": "24hrs", "close": "24hrs", "isOpen": true}], "sunday": [{"id": "7", "open": "24hrs", "close": "24hrs", "isOpen": true}], "tuesday": [{"id": "2", "open": "24hrs", "close": "24hrs", "isOpen": true}], "saturday": [{"id": "6", "open": "24hrs", "close": "24hrs", "isOpen": true}], "thursday": [{"id": "4", "open": "24hrs", "close": "24hrs", "isOpen": true}], "wednesday": [{"id": "3", "open": "24hrs", "close": "24hrs", "isOpen": true}]}',
        'closed_hours_voice_prompt': '{"tts": null, "file": null, "enabled": false}',
        'closed_hours_auto_reply_text': '{"enabled": false, "message": null}',
        'triggers': '[{"id": "f411da57-c5ed-4048-8d3f-2eeb19e1032b", "type": 1, "valid": true, "value": 0, "symbol": null, "tag_ids": [], "keywords": [], "stage_id": "1", "variable": null, "direction": 1, "operation": "create_hubspot_ticket", "pipeline_id": "0", "ticket_name": "Missed Inbound Call From [FirstName]", "workflow_ids": [], "has_condition": false, "disposition_status": 3, "ticket_description": "Call was missed on [LineName] line", "disposition_status_id": []}, {"id": "f84912ef-e1d3-4d73-9a33-4232104472dc", "type": 2, "valid": true, "value": 0, "symbol": null, "tag_ids": [], "keywords": [], "stage_id": "1", "variable": null, "direction": 1, "operation": "create_hubspot_ticket", "pipeline_id": "0", "ticket_name": "Inbound SMS From [FirstName]", "workflow_ids": [], "has_condition": false, "disposition_status": 4, "ticket_description": "SMS was received on [LineName] line", "disposition_status_id": []}]',
        'ivr_steps': '[{"id": "2e7f79f3-23f0-4919-b423-b5740e717516", "key": null, "task": "route_to_extension", "type": "normal", "valid": true, "tag_ids": [], "message_tts": null, "message_file": null, "workflow_ids": [], "route_to_user_id": null, "call_router_behavior": 1, "listen_for_extension": true, "reroute_to_campaign_id": null, "route_to_ring_group_id": false, "route_to_destination_id": false}, {"id": "16a2ad16-902c-4b36-97dc-9b38b673bd32", "key": "*", "task": "replay", "type": "normal", "valid": true, "tag_ids": [], "message_tts": null, "message_file": null, "workflow_ids": [], "route_to_user_id": null, "call_router_behavior": null, "listen_for_extension": false, "reroute_to_campaign_id": null, "route_to_ring_group_id": null, "route_to_destination_id": null}, {"id": "e03c5f16-fdb0-4dfd-a1b2-67f09c7ed4fe", "key": null, "task": "replay", "type": "exit", "valid": true, "tag_ids": [], "message_tts": null, "message_file": null, "workflow_ids": [], "route_to_user_id": null, "call_router_behavior": null, "listen_for_extension": false, "reroute_to_campaign_id": null, "route_to_ring_group_id": null}, {"id": "d2828df6-eb04-47d0-bad1-49643c15b82b", "key": "1", "task": "route_to_ring_group", "type": "normal", "valid": true, "tag_ids": [], "message_tts": null, "message_file": null, "workflow_ids": [], "route_to_user_id": null, "call_router_behavior": null, "listen_for_extension": false, "reroute_to_campaign_id": null, "route_to_ring_group_id": 188, "route_to_destination_id": null}]',
        'pool_size': null,
        'pool_options': null,
        'visitor_tracking_mode': null,
        'visitor_tracking_options': null,
        'active': true,
        'has_local_presence': false,
        'tracking_source': null,
        'has_messaging_service': false,
        'dni_script_address': 'https: //app.alodev.org/v1/sZwMTAmV/dni.js',
        'incoming_number': '+15027473216',
        'missed_calls_settings': {
          'id': 1,
          'model_id': 10,
          'model_type': 'AppModelsCampaign',
          'company_id': 7,
          'missed_call_handling_mode': 2,
          'voicemail_tts': 'We are sorry, but no agents are available to take this call. Please leave your message after the beep.',
          'voicemail_file': null,
          'reroute_to_campaign_id': null,
          'forward_to': '+18189005934',
          'deleted_at': null,
          'created_at': '2020-08-27 00:12:44',
          'updated_at': '2020-11-13 17:30:11'
        },
        'first_incoming_number': {
          'id': 393,
          'company_id': 7,
          'campaign_id': 10,
          'phone_number': '+15027473216',
          'city': '',
          'state': 'KY',
          'country': 'US',
          'label': 'Facebook Referrals-incoming number',
          'non_billable': false,
          'is_tollfree': false,
          'is_rented': true,
          'do_not_use': false,
          'is_voice_capable': false,
          'is_fax_capable': false,
          'is_sms_capable': false,
          'is_mms_capable': false,
          'is_fax': false,
          'default_callerid': false,
          'created_at': '2019-07-24 16:53:38',
          'updated_at': '2021-08-24 21:18:25'
        },
        'incoming_numbers': [
          {
            'id': 393,
            'company_id': 7,
            'campaign_id': 10,
            'phone_number': '+15027473216',
            'city': '',
            'state': 'KY',
            'country': 'US',
            'label': 'Facebook Referrals-incoming number',
            'non_billable': false,
            'is_tollfree': false,
            'is_rented': true,
            'do_not_use': false,
            'is_voice_capable': false,
            'is_fax_capable': false,
            'is_sms_capable': false,
            'is_mms_capable': false,
            'is_fax': false,
            'default_callerid': false,
            'created_at': '2019-07-24 16:53:38',
            'updated_at': '2021-08-24 21:18:25'
          }
        ],
        'default_filter': null
      },
      communications: [
        {
          'id': 1591025,
          'company_id': 7,
          'contact_id': 210470,
          'user_id': null,
          'from': null,
          'to': 'Aloware Contact',
          'property': 'first_name',
          'notes': null,
          'created_at': '2021-09-29 17: 58: 41'
        },
        {
          'id': 1591024,
          'company_id': 7,
          'contact_id': 210470,
          'user_id': null,
          'from': null,
          'to': '+16033166810',
          'property': 'phone_number',
          'notes': null,
          'created_at': '2021-09-29 17: 58: 41'
        },
        {
          'id': 1591026,
          'company_id': 7,
          'contact_id': 210470,
          'user_id': null,
          'from': null,
          'to': '(+16033166810)',
          'property': 'last_name',
          'notes': null,
          'created_at': '2021-09-29 17: 58: 41'
        },
        {
          'id': 48578,
          'company_id': 7,
          'campaign_id': 542,
          'ring_group_id': null,
          'owner_id': null,
          'workflow_id': null,
          'broadcast_id': null,
          'incoming_number_id': 2069,
          'incoming_number': '+19893751337',
          'contact_id': 210470,
          'call_disposition_id': null,
          'lead_number': '+16033166810',
          'target_users': null,
          'attempt': null,
          'attempting_users': null,
          'user_id': null,
          'destination_number': null,
          'transfer_prior_user_ids': null,
          'transfer_target_user_ids': null,
          'in_cold_transfer': false,
          'direction': 1,
          'type': 1,
          'is_read': null,
          'recorded_file_is_migrated': false,
          'voicemail_is_migrated': false,
          'legc_uuid': null,
          'legc_status': null,
          'first_time_caller': 1,
          'body': '',
          'attachments': null,
          'conference_status2': null,
          'current_status2': 9,
          'disposition_status2': 6,
          'resolution2': 3,
          'callback_status': null,
          'transfer_type': null,
          'rejected_by_app': 0,
          'duration': 10,
          'talk_time': 0,
          'wait_time': 10,
          'csat_score': 0,
          'notes': 'Sys (10: 58am PDT):  Routed to line voicemailnSystem:  Dead end call.n',
          'country': 'US',
          'state': 'NH',
          'city': 'DURHAM',
          'engagement_data': null,
          'created_at': '2021-09-29 17: 58: 43',
          'has_recording': false,
          'has_voicemail': false,
          'campaign': {
            'id': 542,
            'company_id': 7,
            'ring_group_id': null,
            'ivr_text_ring_group_id': null,
            'user_id': null,
            'default_filter_id': null,
            'name': '+19893751337',
            'description': null,
            'should_greet': false,
            'greeting_tts': '-',
            'greeting_file': null,
            'should_ask_for_text_authorization': false,
            'ask_for_text_authorization_tts': null,
            'ask_for_text_authorization_file': null,
            'should_whisper': false,
            'whisper_tts': '-',
            'whisper_file': null,
            'should_record': false,
            'record_tts': '-',
            'record_file': null,
            'voicemail_tts': 'We are sorry, but no agents are available to take this call. Please leave your message after the beep.',
            'voicemail_file': null,
            'review_required': 0,
            'review_duration': 60,
            'is_proxy': 0,
            'caller_id_option': 0,
            'missed_call_handling_mode': 1,
            'missed_call_handling_options': '{"forward_to":  "", "reroute_to_campaign_id":  ""}',
            'call_router_behavior': 3,
            'ivr_prompt_tts': null,
            'ivr_prompt_file': null,
            'should_message_if_missed': false,
            'missed_call_message': null,
            'should_block_spam': false,
            'created_at': '2021-07-10 04: 55: 09',
            'updated_at': '2021-07-10 04: 55: 09',
            'type': 0,
            'subtype': null,
            'is_fax': false,
            'operating_hours': '{"friday": [{"id": "5", "open": "24hrs", "close": "24hrs", "isOpen": true}], "monday": [{"id": "1", "open": "24hrs", "close": "24hrs", "isOpen": true}], "sunday": [{"id": "7", "open": "24hrs", "close": "24hrs", "isOpen": true}], "tuesday": [{"id": "2", "open": "24hrs", "close": "24hrs", "isOpen": true}], "saturday": [{"id": "6", "open": "24hrs", "close": "24hrs", "isOpen": true}], "thursday": [{"id": "4", "open": "24hrs", "close": "24hrs", "isOpen": true}], "wednesday": [{"id": "3", "open": "24hrs", "close": "24hrs", "isOpen": true}]}',
            'closed_hours_voice_prompt': '"{"tts": null, "file": null, "enabled": false}',
            'closed_hours_auto_reply_text': '{"enabled": false, "message": null}',
            'triggers': null,
            'ivr_steps': null,
            'pool_size': null,
            'pool_options': null,
            'visitor_tracking_mode': null,
            'visitor_tracking_options': null,
            'active': true,
            'has_local_presence': false,
            'tracking_source': null,
            'has_messaging_service': false,
            'dni_script_address': 'https: //app.alodev.org/v1/sZwMTAmV/dni.js',
            'incoming_number': '+19893751337',
            'first_incoming_number': {
              'id': 2069,
              'company_id': 7,
              'campaign_id': 542,
              'phone_number': '+19893751337',
              'city': '',
              'state': 'MI',
              'country': 'US',
              'label': '+19893751337-incoming number',
              'non_billable': false,
              'is_tollfree': false,
              'is_rented': true,
              'do_not_use': false,
              'is_voice_capable': true,
              'is_fax_capable': false,
              'is_sms_capable': true,
              'is_mms_capable': true,
              'is_fax': false,
              'default_callerid': false,
              'created_at': '2021-03-17 17:45:32',
              'updated_at': '2021-08-13 16:00:54'
            }
          },
          'tags': [],
          'user': null,
          'tag_ids': []
        }
      ]
    }
  }
}
</script>
