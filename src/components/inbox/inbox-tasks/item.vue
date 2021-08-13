<template>
  <div :class="`contact-task-item task-item w-100 d-flex flex-row py-2 pr-2 align-items-center border-bottom ${activeClass}`"
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
                   anchor="top middle"
                   self="center middle">
          {{ contactName }}
        </q-tooltip>
      </div>
      <div class="d-flex flex-row">
        <div class="pr-2">
          <component :is="stateToIcon(4, 2, 2)"
                     height="18px"
                     width="18px">
          </component>
        </div>
        <div class="comm-label text-grey-90 d-flex align-items-center">
          <span v-if="2 !== CommunicationTypes.SMS">
            {{ 2 | fixCommDirection }} {{ 2 | fixCommType }}
          </span>
          <span>
            Last Communication
          </span>
        </div>
      </div>
      <div class="campaign-name text-grey-10">
        ---
      </div>
    </div>
    <div class="actions text-right pb-1">
      <span class="time-passed text-grey-90 mr-2"
            role="button"
            v-if="(2 === CommunicationTypes.CALL && 13 === CommunicationCurrentStatus.CURRENT_STATUS_COMPLETED_NEW) || 2 !== CommunicationTypes.CALL">
        <task-item-time :from-time="contact.last_engagement_at" :update-interval="6000"></task-item-time>
      </span>
      <div class="time-passed text-grey-90 d-flex flex-row justify-center"
           v-else-if="2 === CommunicationTypes.CALL && [CommunicationCurrentStatus.CURRENT_STATUS_RINGALL_NEW, CommunicationCurrentStatus.CURRENT_STATUS_RINGING_NEW].includes(13)">
        <div class="px-2">
          <cancel-call-icon role="button"/>
        </div>
        <div class="px-2">
          <accept-call-icon role="button"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Avatar from 'components/avatar'
import { avatarMixin, communicationInfoMixin } from 'src/plugins/mixins'
import * as CommunicationTypes from 'src/constants/communication-types'
import * as CommunicationDispositionStatus from 'src/constants/communication-disposition-status'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import TaskItemTime from 'components/inbox/channel-tasks/task-item-time'
import CancelCallIcon from 'components/icons/cancel-call-icon'
import AcceptCallIcon from 'components/icons/accept-call-icon'
import { mapActions, mapState } from 'vuex'
export default {
  name: 'inbox-task-item',
  mixins: [avatarMixin, communicationInfoMixin],
  components: { AcceptCallIcon, CancelCallIcon, TaskItemTime, Avatar },
  props: {
    contact: {
      required: true
    }
  },
  computed: {
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
      return this.contact.unread_count + this.contact.unread_missed_call_count + this.contact.unread_voicemail_count
    }
  },
  data () {
    return {
      CommunicationTypes,
      CommunicationDispositionStatus,
      CommunicationCurrentStatus
    }
  },
  methods: {
    ...mapActions('inbox', ['setSelectedContact']),
    onItemClick (contact) {
      if (this.selectedContact && this.selectedContact.id === contact.id) {
        return
      }
      this.setSelectedContact(contact)
      this.$router.push({
        name: 'Inbox Contact Task',
        params: {
          id: contact.id.toString(),
          channel: 'inbox'
        }
      }).catch(err => {
        console.log(err)
      })
    }
  }
}
</script>
