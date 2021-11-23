<template>
  <div :class="`contact-task-item task-item w-100 d-flex flex-row py-2 pr-2 align-items-center border-bottom position-relative ${activeClass}`"
       @click="onItemClick(contact)">
    <div class="avatar d-flex justify-content-center pb-1 position-relative"
         role="button">
      <b-badge v-if="totalUnreads > 0"
               class="contact-unread-badge d-flex justify-center align-items-center position-absolute"
               variant="danger"
               pill>
        {{ totalUnreads }}
      </b-badge>
      <avatar width="34"
              height="34"
              :style="avatarStyle(false)"
              :name="contactName">
      </avatar>
    </div>
    <div class="task-details flex-grow-1 pb-1"
         role="button">
      <div class="contact-name">
        {{ contactName | truncate(20) }}
        <q-tooltip content-class="bg-grey-light11"
                   anchor="top left"
                   self="top left"
                   :offset="[0, 33]">
          {{ contactName }}
        </q-tooltip>
      </div>
      <div class="d-flex flex-row" v-if="contact.last_communication">
        <div class="pr-2">
          <component :is="stateToIcon(contact.last_communication.disposition_status2, contact.last_communication.type, contact.last_communication.direction)"
                     height="18px"
                     width="18px">
          </component>
        </div>
        <div class="comm-label text-grey-90 d-flex align-items-center">
          <span>
            {{ contact.last_communication.direction | fixCommDirection }} {{ contact.last_communication.type | fixCommType }}
          </span>

        </div>
      </div>
      <div class="campaign-name text-grey-10" v-if="contact.last_communication">
        {{ campaignName }}
      </div>
    </div>
    <div class="actions text-right pb-1" v-if="contact.last_communication">
      <span class="time-passed text-grey-90 mr-2"
            role="button"
            v-if="(contact.last_communication.type === CommunicationTypes.CALL && contact.last_communication.current_status2 === CommunicationCurrentStatus.CURRENT_STATUS_COMPLETED_NEW) || contact.last_communication.type !== CommunicationTypes.CALL">
        <task-item-time :from-time="contact.last_communication.created_at" :update-interval="6000"></task-item-time>
      </span>
      <div class="time-passed text-grey-90 d-flex flex-row justify-center"
           v-else-if="contact.last_communication.direction === CommunicationDirection.INBOUND && contact.last_communication.type === CommunicationTypes.CALL && [CommunicationCurrentStatus.CURRENT_STATUS_RINGALL_NEW, CommunicationCurrentStatus.CURRENT_STATUS_RINGING_NEW].includes(contact.last_communication.current_status2)">
        <div class="pl-0">
          <cancel-call-icon role="button"/>
        </div>
        <div class="pl-2 pr-0">
          <accept-call-icon role="button"/>
        </div>
      </div>
    </div>

    <div class="overlay position-absolute opacity-1 text-center pt-2" v-if="isReopened && !isSearch">
      <avatar width="34"
              height="34"
              :style="avatarStyle(false)"
              :name="contactName">
      </avatar>
      <p class="text-muted _500">You reopened this conversation</p>
    </div>
  </div>
</template>

<script>
import Avatar from 'components/avatar'
import { avatarMixin, communicationInfoMixin } from 'src/plugins/mixins'
import * as CommunicationTypes from 'src/constants/communication-types'
import * as CommunicationDispositionStatus from 'src/constants/communication-disposition-status'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import * as CommunicationDirection from 'src/constants/communication-direction'
import TaskItemTime from 'components/inbox/channel-tasks/task-item-time'
import CancelCallIcon from 'components/icons/cancel-call-icon'
import AcceptCallIcon from 'components/icons/accept-call-icon'
import { mapState } from 'vuex'
import _ from 'lodash'
export default {
  name: 'inbox-task-item',

  mixins: [avatarMixin, communicationInfoMixin],

  components: { AcceptCallIcon, CancelCallIcon, TaskItemTime, Avatar },

  props: {
    contact: {
      required: true
    },
    loadingContact: {
      type: Boolean,
      default: false
    },
    isSearch: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  computed: {
    ...mapState(['campaigns']),
    ...mapState('inbox', ['selectedContact']),
    contactName () {
      if (this.contact && this.contact.first_name && this.contact.last_name) {
        return `${this.contact.first_name} ${this.contact.last_name}`
      }

      return 'No Name'
    },
    activeClass () {
      return this.selectedContact && this.selectedContact.id === this.contact.id ? 'active' : ''
    },
    totalUnreads () {
      return this.contact.unread_texts_count + this.contact.unread_missed_calls_count + this.contact.unread_voicemails_count
    },
    campaignName () {
      if (_.isEmpty(this.campaigns) || !this.contact.last_communication.campaign_id) {
        return '-'
      }
      const campaign = this.campaigns.find(campaign => campaign.id === this.contact.last_communication.campaign_id)
      if (campaign) {
        return campaign.name
      }
      return '-'
    },
    isReopened () {
      return this.$route.params.status &&
        this.$route.params.status !== 'open' &&
        this.$options.filters.fixTaskStatusName(this.contact.task_status).toLowerCase() === 'open' &&
        !this.loadingContact
    }
  },

  data () {
    return {
      CommunicationTypes,
      CommunicationDispositionStatus,
      CommunicationCurrentStatus,
      CommunicationDirection
    }
  },

  methods: {
    onItemClick (contact) {
      if (this.selectedContact && this.selectedContact.id === contact.id && !this.isReopened) {
        return
      }
      this.$emit('onItemSelected', contact)
    }
  }
}
</script>
