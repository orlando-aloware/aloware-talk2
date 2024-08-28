<template>
  <div class="contact-activity-container w-100"
       :class="{ 'h-93': isTrialBannerVisible }">
    <contact-activities-header
      :label="contactName"
      :hasUnreads="hasUnreads"
      :unreadCount="unreadCount"
      :contact="contact"
      data-testid="contact-activities-header"
      @markAllAsRead="markAllAsRead"
      @toggleDrawer="$emit('toggleDrawer')"
      @toggleDetails="$emit('toggleDetails')"/>

      <div :class="['contact-activities', { 'contact-activities-hs-widget':  isWidget} ]">
        <b-overlay class="h-100 w-100"
                   variant="white"
                   rounded="sm"
                   data-testid="contact-activities-overlay"
                   :show="loadingCommunications"
                   :opacity="0.85">
          <div class="inner-1">
          <div class="inner-2 scrollbar-white"
               ref="activitiesWrap">
            <div class="d-flex flex-row w-100 pb-3 justify-content-center align-items-center pt-2">
              <slot name="moreActivities">
              </slot>
            </div>
            <contact-activity v-for="(communication, index) in communications"
                              data-testid="contact-activities-activity-1"
                              :key="communication.id + '-comm-' + index"
                              :ref="(communication.type !== undefined ? 'communication-' : 'contact-audit-') + communication.id"
                              :communication="communication"
                              :contact="contact"
                              :campaignId="campaignId">
            </contact-activity>
            <contact-activity v-for="(communication, index) in sendingCommunications"
                              data-testid="contact-activities-activity-2"
                              v-bind:key="'sending-comm-' + index"
                              ref="communication-0"
                              :communication="communication"
                              :contact="contact"
                              :campaignId="communication.campaignId">
            </contact-activity>
          </div>
        </div>
          <template #overlay>
            <div class="text-center">
              <q-spinner-bars
                color="primary"
                size="2em"
              />
              <p id="cancel-label">Loading communications...</p>
            </div>
          </template>
        </b-overlay>
      </div>

    <div class="composer-container-wrapper">
      <message-composer :campaignId="campaignId"
                        data-testid="contact-activities-message-composer"
                        @message-sent="setSendingCommunication">
      </message-composer>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import { mapGetters, mapState } from 'vuex'
import ContactActivitiesHeader from 'src/components/contacts/contact-activities-header'
import ContactActivity from 'src/components/contacts/contact-activity'
import MessageComposer from 'src/components/message-composer/message-composer'
import * as CommunicationTypes from 'src/constants/communication-types'

export default {
  name: 'contact-activities',
  components: {
    MessageComposer,
    ContactActivitiesHeader,
    ContactActivity
  },
  props: {
    communications: {
      required: true,
      type: Array,
      default: () => []
    },
    campaignId: {
      required: false
    },
    loadingCommunications: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      isLoadingPreviousActivities: false,
      sendingCommunications: []
    }
  },
  watch: {
    communications: function (communications) {
      let lastComm = communications[communications.length - 1]
      for (const [index, value] of this.sendingCommunications.entries()) {
        // Remove pending communication that was created if it's already processed by the API
        if (this.isSameCommunication(value, lastComm)) {
          this.sendingCommunications.splice(index, 1)
          break
        }
      }
    },
    'contact.id': function () {
      this.sendingCommunications = []
    }
  },
  computed: {
    ...mapState(['isTrialBannerVisible', 'isWidget']),
    ...mapGetters('contacts', ['contact']),
    contactName () {
      if (this.contact && this.contact.name) {
        return _.get(this.contact, 'name', '')
      }

      if (this.contact && this.contact.first_name && this.contact.last_name) {
        return `${this.contact.first_name} ${this.contact.last_name}`
      }

      return 'No Name'
    },
    hasUnreads () {
      return this.contact.unread_texts_count > 0 ||
        this.contact.unread_missed_calls_count > 0 ||
        this.contact.unread_voicemails_count > 0
    },
    unreadCount () {
      return this.contact.unread_texts_count + this.contact.unread_missed_calls_count + this.contact.unread_voicemails_count
    }
  },
  methods: {
    isSameCommunication (comm1, comm2) {
      // check if comms are not empty
      const isEmptyComms = _.isEmpty(comm1) || _.isEmpty(comm2)
      // check if both comms' type are not the same
      const notSameCommType = !isEmptyComms && comm1.type !== comm2.type

      if (isEmptyComms ||
        notSameCommType) {
        return false
      }

      // If it's a note, the verification should remove new line special chars,
      // that are automatically added at the end of the note
      if ([comm1.type, comm2.type].includes(CommunicationTypes.NOTE)) {
        let body1 = comm1.body.replace(/(\r\n|\n|\r)/gm, '').trim()
        let body2 = comm2.body.replace(/(\r\n|\n|\r)/gm, '').trim()
        return body1 === body2
      }

      // If it's an email, the message and subject need to be checked
      if (comm1.type === CommunicationTypes.EMAIL && comm2.type === CommunicationTypes.EMAIL) {
        let body = comm2.body.split(/\r?\n/)

        let subject = body[0].split(':')[1].trim()
        let message = body.slice(3, body.length).reduce((cumulative, current) => cumulative + current).trim()

        let comparison = this.compareMessages(comm1.message, message)

        return subject === comm1.subject && comparison
      }

      // If it's a fax, it won't have any text to compare.
      // Then, we can check if the created_at time is reasonably similar
      if ([comm1.type, comm2.type].includes(CommunicationTypes.FAX)) {
        return window.moment.utc(comm2.created_at).diff(comm1.created_at) < 15 * 1000
      }

      // If it's an sms, test to see if there are variables in the body
      if (comm1.type === CommunicationTypes.SMS && comm2.type === CommunicationTypes.SMS) {
        return this.compareMessages(comm1.body, comm2.body)
      }

      return comm1.body === comm2.body
    },
    compareMessages (string1, string2) {
      let bodyArray = string1.replace(/\n/g, ' ').split(' ')

      for (let word of bodyArray) {
        // if contains bracket at beginning or at the end, it's probably a variable
        // Variables don't need to be checked, because they are not
        if (!word.includes('[') && !word.includes(']') && !string2.includes(word)) {
          console.log({ word })
          return false
        }
      }

      return true
    },
    scrollMessages () {
      const activitiesWrap = this.$refs.activitiesWrap
      if (activitiesWrap && activitiesWrap.scrollHeight) {
        activitiesWrap.scrollTop = activitiesWrap.scrollHeight
      }
    },
    markAllAsRead () {
      this.$emit('markAllAsRead')
    },
    setSendingCommunication (message) {
      this.sendingCommunications.push(message)

      setTimeout(() => {
        this.scrollMessages()
      }, 500)
    }
  }
}
</script>

<style scoped lang="scss">
.contact-activity-container {
  .contact-activities-hs-widget {
    min-height: 250px;

    @media (max-height: 500px) {
      height: 250px !important;
    }
  }
}
</style>
