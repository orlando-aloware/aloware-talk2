import * as ChannelType from 'src/constants/inbox-channels'
import * as Filters from 'src/constants/filters'
import { CALLS_CHANNEL, DEFAULT_COMMUNICATIONS_CHANNEL, RECORDINGS_CHANNEL, VOICEMAILS_CHANNEL } from 'src/router/routes'

export default {
  selectedFilter: (state) => state.selectedFilter,
  hasMoreContacts: (state) => state.hasMoreContacts,
  getOpenTaskCount: (state) => state.taskCounts.open,
  allSavedFilters: (state) => [...state.personalFilters, ...state.inboxCompanyFilters],
  communicationsCount: (state) => state.communicationsCount,
  inboxFilters: (state) => state.inboxFilters,

  channelDefaultFilterModel (state) {
    const { value: channel, answerStatus, type } = state.activeChannel || {}

    console.log('starting to set the default filter model')

    console.log('the selected channel is:', channel)
    console.log('the selected answer status is:', answerStatus)
    console.log('the selected type is:', type)

    let defaultFilterModel = {
      name: '',
      type: ChannelType.CHANNEL_MESSAGES,
      filter: {

      },
      scope: 'user'
    }

    if (channel === VOICEMAILS_CHANNEL) {
      defaultFilterModel.type = ChannelType.CHANNEL_VOICEMAILS
      defaultFilterModel.filter = {
        campaigns: Filters.DEFAULT_STATE.filter.campaigns,
        ring_groups: Filters.DEFAULT_STATE.filter.ring_groups,
        direction: Filters.DEFAULT_STATE.filter.direction,
        tags: Filters.DEFAULT_STATE.filter.tags,
        first_time_only: Filters.DEFAULT_STATE.filter.first_time_only,
        untagged_only: Filters.DEFAULT_STATE.filter.untagged_only,
        exclude_automated_communications: Filters.DEFAULT_STATE.filter.exclude_automated_communications,
        incoming_numbers: Filters.DEFAULT_STATE.filter.incoming_numbers,
        users: Filters.DEFAULT_STATE.filter.users,
        workflows: Filters.DEFAULT_STATE.filter.workflows,
        contact_owner: Filters.DEFAULT_STATE.filter.contact_owner,
        from_date: Filters.DEFAULT_STATE.filter.from_date,
        to_date: Filters.DEFAULT_STATE.filter.to_date,
        my_contact: Filters.DEFAULT_STATE.filter.my_contact,
        has_international: Filters.DEFAULT_STATE.filter.has_international,
        teams: Filters.DEFAULT_STATE.filter.teams,
        contact_lists: Filters.DEFAULT_STATE.filter.contact_lists,
        answer_status: answerStatus,
        unread_only: 0,
        type
      }
      return defaultFilterModel
    }

    if ([CALLS_CHANNEL, RECORDINGS_CHANNEL].includes(channel)) {
      defaultFilterModel.type = ChannelType.CHANNEL_CALLS
      defaultFilterModel.filter = {
        campaigns: Filters.DEFAULT_STATE.filter.campaigns,
        ring_groups: Filters.DEFAULT_STATE.filter.ring_groups,
        direction: Filters.DEFAULT_STATE.filter.direction,
        answer_status: Filters.DEFAULT_STATE.filter.answer_status,
        min_talk_time: Filters.DEFAULT_STATE.filter.min_talk_time,
        transfer_type: Filters.DEFAULT_STATE.filter.transfer_type,
        callback_status: Filters.DEFAULT_STATE.filter.callback_status,
        tags: Filters.DEFAULT_STATE.filter.tags,
        call_dispositions: Filters.DEFAULT_STATE.filter.call_dispositions,
        first_time_only: Filters.DEFAULT_STATE.filter.first_time_only,
        untagged_only: Filters.DEFAULT_STATE.filter.untagged_only,
        exclude_automated_communications: Filters.DEFAULT_STATE.filter.exclude_automated_communications,
        incoming_numbers: Filters.DEFAULT_STATE.filter.incoming_numbers,
        users: Filters.DEFAULT_STATE.filter.users,
        workflows: Filters.DEFAULT_STATE.filter.workflows,
        contact_owner: Filters.DEFAULT_STATE.filter.contact_owner,
        from_date: Filters.DEFAULT_STATE.filter.from_date,
        to_date: Filters.DEFAULT_STATE.filter.to_date,
        my_contact: Filters.DEFAULT_STATE.filter.my_contact,
        has_international: Filters.DEFAULT_STATE.filter.has_international,
        teams: Filters.DEFAULT_STATE.filter.teams,
        contact_lists: Filters.DEFAULT_STATE.filter.contact_lists,
        unread_only: 0,
        type
      }

      if ([RECORDINGS_CHANNEL].includes(channel)) {
        defaultFilterModel.type = ChannelType.CHANNEL_RECORDINGS
        defaultFilterModel.filter.answer_status = answerStatus
      }
      return defaultFilterModel
    }

    if (channel === DEFAULT_COMMUNICATIONS_CHANNEL) {
      defaultFilterModel.type = ChannelType.CHANNEL_ALL_COMMUNICATIONS
      defaultFilterModel.filter = {
        ...Filters.DEFAULT_STATE.filter,
        changed: true,
        unread_only: 0,
        type: 'all'
      }

      return defaultFilterModel
    }

    if (channel === 'my-personal-line') {
      defaultFilterModel.type = ChannelType.CHANNEL_ALL_COMMUNICATIONS
      defaultFilterModel.filter = {
        ...Filters.DEFAULT_STATE.filter,
        campaigns: [this.profile.campaign_id]
      }

      return defaultFilterModel
    }

    defaultFilterModel.type = ChannelType.CHANNEL_MESSAGES
    defaultFilterModel.filter = {
      campaigns: Filters.DEFAULT_STATE.filter.campaigns,
      direction: Filters.DEFAULT_STATE.filter.direction,
      tags: Filters.DEFAULT_STATE.filter.tags,
      first_time_only: Filters.DEFAULT_STATE.filter.first_time_only,
      untagged_only: Filters.DEFAULT_STATE.filter.untagged_only,
      exclude_automated_communications: Filters.DEFAULT_STATE.filter.exclude_automated_communications,
      incoming_numbers: Filters.DEFAULT_STATE.filter.incoming_numbers,
      users: Filters.DEFAULT_STATE.filter.users,
      workflows: Filters.DEFAULT_STATE.filter.workflows,
      broadcasts: Filters.DEFAULT_STATE.filter.broadcasts,
      contact_owner: Filters.DEFAULT_STATE.filter.contact_owner,
      from_date: Filters.DEFAULT_STATE.filter.from_date,
      to_date: Filters.DEFAULT_STATE.filter.to_date,
      my_contact: Filters.DEFAULT_STATE.filter.my_contact,
      creator_type: Filters.DEFAULT_STATE.filter.creator_type,
      has_international: Filters.DEFAULT_STATE.filter.has_international,
      answer_status: answerStatus,
      type: 'sms',
      unread_only: 0
    }

    return defaultFilterModel
  }
}
