<template>
  <div :class="`task-item w-100 d-flex flex-row py-2 pr-2 align-items-center border-bottom ${activeClass}`"
       @click="onItemClick(mention)">
    <div class="avatar d-flex justify-content-center pb-1"
         role="button">
      <i v-if="!mention.mention_subject.is_read && mention.mention_subject.direction === CommunicationDirection.INBOUND"
         class="fa fa-circle position-relative"
         style="color: rgb(64, 158, 255); font-size: 50%; position: absolute; left: -5px;">
      </i>
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
                   anchor="top middle"
                   self="center middle">
          {{ contactName }}
        </q-tooltip>
      </div>
      <div class="d-flex flex-row">
        <div class="comm-label mention-content text-grey-90 d-flex align-items-center mt-1">
          <span v-if="mention.preview_text !== null" v-html="parseBody"></span>
        </div>
      </div>
      <div class="campaign-name text-grey-10 mt-1">
        {{ directionSummaryText }}
      </div>
    </div>
    <div class="actions text-right pb-1">
      <span class="time-passed text-grey-90 mr-2"
            role="button">
        <task-item-time :from-time="mention.created_at" :update-interval="6000"></task-item-time>
      </span>
    </div>
  </div>
</template>

<script>
import { avatarMixin, communicationInfoMixin } from 'src/plugins/mixins'
import Avatar from 'components/avatar'
import { mapActions, mapState } from 'vuex'
import * as CommunicationDirection from 'src/constants/communication-direction'
import * as CommunicationDispositionStatus from 'src/constants/communication-disposition-status'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import * as CommunicationTypes from 'src/constants/communication-types'
import TaskItemTime from 'components/inbox/channel-tasks/task-item-time'

export default {
  name: 'task-mention-item',

  mixins: [
    avatarMixin,
    communicationInfoMixin
  ],

  components: {
    TaskItemTime,
    Avatar
  },

  props: {
    mention: {
      required: true
    },

    direction: {
      type: String,
      required: false,
      default: 'received'
    }
  },

  data () {
    return {
      CommunicationDirection,
      CommunicationDispositionStatus,
      CommunicationCurrentStatus,
      CommunicationTypes
    }
  },

  computed: {
    ...mapState(['users']),
    ...mapState('inbox', ['selectedCommunication', 'activeChannel']),

    contactName () {
      return this.mention.mention_subject.contact ? this.mention.mention_subject.contact.name : 'No Name'
    },

    directionSummaryText () {
      return this.direction === 'received' ? `@${this.mentioner.name} mentioned you` : `Sent to @${this.mentioned.name}`
    },

    activeClass () {
      return this.selectedCommunication && this.mention.id === this.selectedCommunication.id ? 'active' : ''
    },

    mentioner () {
      return this.users.find(user => user.id === this.mention.mentioner_user_id)
    },

    mentioned () {
      return this.users.find(user => user.id === this.mention.mentioned_user_id)
    },
    parseBody () {
      return this.$options.filters.parseMentionToView(this.mention.preview_text)
    }
  },

  methods: {
    markable (mention) {
      // Markable if mention is SMS and the comm direction is INBOUND
      let smsRule = mention.type === CommunicationTypes.SMS &&
        mention.direction === CommunicationDirection.INBOUND
      // Markable if mention is a CALL and disposition_status2 is VOICEMAIL_NEW or MISSED_NEW
      let callRule = mention.type === CommunicationTypes.CALL &&
        [CommunicationDispositionStatus.DISPOSITION_STATUS_MISSED_NEW, CommunicationDispositionStatus.DISPOSITION_STATUS_VOICEMAIL_NEW].includes(mention.disposition_status2) &&
        mention.direction === CommunicationDirection.INBOUND

      return smsRule || callRule
    },

    setContact (id) {
      this.setContactId(id)
    },

    onItemClick (mention) {
      this.setSelectedCommunication(mention)
      this.$router.push({
        name: 'Inbox Contact Mention Communication',
        params: {
          id: mention.mention_subject.contact_id, // mention.contact_id.toString(),
          communicationId: mention.mention_subject_id,
          status: this.direction,
          channel: 'mentions'
        }
      }).catch(err => {
        console.log(err)
      })
    },

    ...mapActions('inbox', ['setContactId', 'setSelectedCommunication', 'setActiveChannel'])
  }
}
</script>
