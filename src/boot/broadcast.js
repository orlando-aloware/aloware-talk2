import Echo from 'laravel-echo'
import store from '../store/index'
import _ from 'lodash'

export default {
  get profile () {
    return store().getters['auth/profile']
  },
  get authenticated () {
    return store().getters['auth/authenticated']
  },
  init () {
    console.log('initiating broadcast')
    /**
     * Echo exposes an expressive API for subscribing to channels and listening
     * for events that are broadcast by Laravel. Echo and event broadcasting
     * allows your team to easily build robust real-time web applications.
     */
    window.Echo = new Echo({
      authEndpoint: process.env.API_URL + '/broadcasting/auth',
      broadcaster: 'pusher',
      key: localStorage.getItem('pusher_app_key'),
      cluster: localStorage.getItem('pusher_cluster'),
      encrypted: true,
      auth: {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('api_token')
        }
      }
    })
    console.log('broadcast initiated')
    this.listen()
  },

  listen () {
    const userId = _.get(this.profile, 'id', null)

    if (!userId) {
      return
    }

    window.Echo.private('user-' + this.profile.id)
      .listen('.user.status.updated', (event) => {
        store().commit('SET_USER_STATUS', event.status)
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
        window.VueEvent.fire('new_in_app_contact_assigned', contact)
      })
      .listen('.user.in-app.appointment', (event) => {
        let engagement = event.engagement
        let contact = event.contact
        let timeDiff = event.time_diff
        let unit = event.unit
        window.VueEvent.fire('new_in_app_appointment', { engagement, contact, timeDiff, unit })
      })
      .listen('.user.in-app.reminder', (event) => {
        let engagement = event.engagement
        let contact = event.contact
        let timeDiff = event.timeDiff
        let unit = event.unit
        window.VueEvent.fire('new_in_app_reminder', { engagement, contact, timeDiff, unit })
      })
      .listen('.user.in-app.communication.new_call', (event) => {
        let campaign = store().state.campaigns.find(campaign => campaign.id === event.communication.campaign_id)
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
          window.VueEvent.fire('new_in_app_call', communication)
        }
      })
      .listen('.user.in-app.communication.answered_call', (event) => {
        let campaign = store().state.campaigns.find(campaign => campaign.id === event.communication.campaign_id)
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
          window.VueEvent.fire('answered_in_app_call', communication)
        }
      })
      .listen('.user.in-app.communication.new_sms', (event) => {
        let campaign = store().state.campaigns.find(campaign => campaign.id === event.communication.campaign_id)
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
          window.VueEvent.fire('new_in_app_sms', communication)
        }
      })
      .listen('.user.in-app.communication.new_voicemail', (event) => {
        let campaign = store().state.campaigns.find(campaign => campaign.id === event.communication.campaign_id)
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
          window.VueEvent.fire('new_in_app_voicemail', communication)
        }
      })
      .listen('.user.in-app.communication.new_fax', (event) => {
        let campaign = store().state.campaigns.find(campaign => campaign.id === event.communication.campaign_id)
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
          window.VueEvent.fire('new_in_app_fax', communication)
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
        window.VueEvent.fire('new_desktop_contact_assigned', contact)
      })
      .listen('.user.desktop.appointment', (event) => {
        let engagement = event.engagement
        let contact = event.contact
        let timeDiff = event.timeDiff
        let unit = event.unit
        window.VueEvent.fire('new_desktop_appointment', { engagement, contact, timeDiff, unit })
      })
      .listen('.user.desktop.reminder', (event) => {
        let engagement = event.engagement
        let contact = event.contact
        let timeDiff = event.timeDiff
        let unit = event.unit
        window.VueEvent.fire('new_desktop_reminder', { engagement, contact, timeDiff, unit })
      })
      .listen('.user.desktop.communication.new_call', (event) => {
        let campaign = store().state.campaigns.find(campaign => campaign.id === event.communication.campaign_id)
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
          window.VueEvent.fire('new_desktop_call', communication)
        }
      })

      .listen('.user.desktop.communication.answered_call', (event) => {
        let campaign = store().state.campaigns.find(campaign => campaign.id === event.communication.campaign_id)
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
          window.VueEvent.fire('new_answered_call', communication)
        }
      })
      .listen('.user.desktop.communication.new_sms', (event) => {
        let campaign = store().state.campaigns.find(campaign => campaign.id === event.communication.campaign_id)
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
          window.VueEvent.fire('new_desktop_sms', communication)
        }
      })
      .listen('.user.desktop.communication.new_voicemail', (event) => {
        let campaign = store().state.campaigns.find(campaign => campaign.id === event.communication.campaign_id)
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
          window.VueEvent.fire('new_desktop_voicemail', communication)
        }
      })
      .listen('.user.desktop.communication.new_fax', (event) => {
        let campaign = store().state.campaigns.find(campaign => campaign.id === event.communication.campaign_id)
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
          window.VueEvent.fire('new_desktop_fax', communication)
        }
      })
      .notification((notification) => {
        if (!this.profile.sleep_mode) {
          switch (notification.type) {
            case 'App\\Notifications\\MentionNotification':
              window.VueEvent.fire('mention', notification)
              break
          }
        }
      })
    window.Echo.private('company-' + this.profile.company_id)
      .listen('.company.updated', (event) => {
        if (store().state.currentCompany && store().state.currentCompany.id === event.company.id) {
          store().dispatch('setCurrentCompany', event.company)
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
        let campaign = store().state.campaigns.find(campaign => campaign.id === event.communication.campaign_id)
        if (campaign) {
          communication.campaign = campaign
        }
        window.VueEvent.fire('new_communication', communication)
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
        let campaign = store().state.campaigns.find(campaign => campaign.id === event.communication.campaign_id)
        if (campaign) {
          communication.campaign = campaign
        }
        window.VueEvent.fire('update_communication', communication)
      })
      .listen('.communication.deleted', (event) => {
        window.VueEvent.fire('delete_communication', event.communication)
      })
      .listen('.incoming_number.created', (event) => {
        let campaign = store().state.campaigns.find(campaign => campaign.id === event.incoming_number.campaign_id)
        if (campaign) {
          campaign.incoming_number = event.incoming_number.phone_number
          store().commit('UPDATE_CAMPAIGN', campaign)
        }
      })
      .listen('.campaign.created', (event) => {
        let campaign = event.campaign
        campaign.last_call_datetime = event.last_call_datetime
        store().commit('NEW_CAMPAIGN', campaign)
        window.VueEvent.fire('campaign_created', campaign)
      })
      .listen('.campaign.updated', (event) => {
        let campaign = event.campaign
        campaign.last_call_datetime = event.last_call_datetime
        store().commit('UPDATE_CAMPAIGN', campaign)
        window.VueEvent.fire('campaign_updated', campaign)
      })
      .listen('.campaign.deleted', (event) => {
        store().commit('DELETE_CAMPAIGN', event.campaign)
        window.VueEvent.fire('campaign_deleted', event.campaign)
      })
      .listen('.tag.created', (event) => {
        let tag = event.tag
        store().commit('NEW_TAG', tag)
        window.VueEvent.fire('tag_created', tag)
      })
      .listen('.tag.updated', (event) => {
        let tag = event.tag
        store().commit('UPDATE_TAG', tag)
        window.VueEvent.fire('tag_updated', tag)
      })
      .listen('.tag.deleting', (event) => {
        let tag = event.tag
        store().commit('DELETE_TAG', tag)
        window.VueEvent.fire('tag_deleting', tag)
      })
      .listen('.disposition_status.created', (event) => {
        let dispositionStatus = event.disposition_status
        store().commit('NEW_DISPOSITION_STATUS', dispositionStatus)
        window.VueEvent.fire('disposition_status_created', dispositionStatus)
      })
      .listen('.disposition_status.updated', (event) => {
        let dispositionStatus = event.disposition_status
        store().commit('UPDATE_DISPOSITION_STATUS', dispositionStatus)
        window.VueEvent.fire('disposition_status_updated', dispositionStatus)
      })
      .listen('.disposition_status.deleted', (event) => {
        let dispositionStatus = event.disposition_status
        store().commit('DELETE_DISPOSITION_STATUS', dispositionStatus)
        window.VueEvent.fire('disposition_status_deleted', dispositionStatus)
      })
      .listen('.call_disposition.bulk_created', (event) => {
        let callDispositions = event.call_dispositions
        store().commit('NEW_BULK_CALL_DISPOSITION', callDispositions)
        window.VueEvent.fire('call_disposition_bulk_created', callDispositions)
      })
      .listen('.call_disposition.created', (event) => {
        let callDisposition = event.call_disposition
        store().commit('NEW_CALL_DISPOSITION', callDisposition)
        window.VueEvent.fire('call_disposition_created', callDisposition)
      })
      .listen('.call_disposition.updated', (event) => {
        let callDisposition = event.call_disposition
        store().commit('UPDATE_CALL_DISPOSITION', callDisposition)
        window.VueEvent.fire('call_disposition_updated', callDisposition)
      })
      .listen('.call_disposition.deleted', (event) => {
        let callDisposition = event.call_disposition
        store().commit('DELETE_CALL_DISPOSITION', callDisposition)
        window.VueEvent.fire('call_disposition_deleted', callDisposition)
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
          window.VueEvent.fire('contact_created', contact)
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
          window.VueEvent.fire('contact_updated', contact)
        }
      })
      .listen('.contact.deleted', (event) => {
        let contact = event.contact
        if (contact) {
          if (event.user) {
            contact.user = event.user
          }
          window.VueEvent.fire('delete_contact', contact)
        }
      })
      .listen('.filter.created', (event) => {
        if (!store().state.filters.find((o) => {
          return o.id === event.filter.id
        })) {
          store().commit('NEW_FILTER', event.filter)
        }
      })
      .listen('.filter.updated', (event) => {
        store().commit('UPDATE_FILTER', event.filter)
      })
      .listen('.filter.deleted', (event) => {
        if (store().state.filters.find((o) => {
          return o.id === event.filter.id
        })) {
          store().commit('DELETE_FILTER', event.filter)
        }
      })
      .listen('.user.created', (event) => {
        if (store().state.currentCompany && event.user.company_id && event.user.company_id === store().state.currentCompany.id) {
          window.VueEvent.fire('user_created', event.user)
        }
      })
      .listen('.user.updated', (event) => {
        window.VueEvent.fire('user_updated', event.user)
      })
      .listen('.user.deleted', (event) => {
        if (store().state.currentCompany && event.user.company_id && event.user.company_id === store().state.currentCompany.id) {
          window.VueEvent.fire('user_deleted', event.user)
        }
      })
      .listen('.workflow.created', (event) => {
        store().commit('NEW_WORKFLOW', event.workflow)
        window.VueEvent.fire('workflow_created', event.workflow)
      })
      .listen('.workflow.updated', (event) => {
        let workflow = event.workflow
        store().commit('UPDATE_WORKFLOW', workflow)
        window.VueEvent.fire('workflow_updated', workflow)
      })
      .listen('.workflow.deleted', (event) => {
        store().commit('DELETE_WORKFLOW', event.workflow)
        window.VueEvent.fire('workflow_deleted', event.workflow)
      })
    window.Echo.join('online-users-company-' + this.profile.company_id)
      // as long as this broadcast will fire, everyone on the presence channel will receive this event
      .listen('.app.newversion', (event) => {
        window.VueEvent.fire('new_version', event.data.message)
      })
  },

  leave () {
    window.Echo.leave('user-' + this.profile.id)
    window.Echo.leave('company-' + this.profile.company_id)
    window.Echo.leave('online-users-company-' + this.profile.company_id)
  }
}
