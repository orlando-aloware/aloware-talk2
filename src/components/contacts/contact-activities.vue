<template>
  <div class="contact-activity-container w-100">
    <contact-activities-header
      :label="contactName"
      :hasUnreads="hasUnreads"
      :unreadCount="unreadCount"
      :contact="resources"
      @markAllAsRead="markAllAsRead"
      @toggleDrawer="$emit('toggleDrawer')"
      @toggleDetails="$emit('toggleDetails')"/>
    <div class="contact-activities">
      <div class="inner-1">
        <div class="inner-2 scrollbar-white"
             ref="activitiesWrap">
          <div class="d-flex flex-row w-100 pb-3 justify-content-center align-items-center pt-2">
            <slot name="moreActivities">
            </slot>
          </div>
          <contact-activity v-for="(communication, index) in communications"
                            :key="communication.id + '-comm-' + index"
                            :ref="(communication.type !== undefined ? 'communication-' : 'contact-audit-') + communication.id"
                            :communication="communication"
                            :contact="resources"
                            :campaignId="campaignId">
          </contact-activity>
        </div>
      </div>
    </div>
    <div class="composer-container-wrapper">
      <message-composer></message-composer>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import { mapGetters } from 'vuex'
import ContactActivitiesHeader from 'src/components/contacts/contact-activities-header'
import ContactActivity from 'src/components/contacts/contact-activity'
import MessageComposer from 'src/components/message-composer/message-composer'

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

    isContactType: {
      type: Boolean,
      default: true
    }
  },

  data () {
    return {
      isLoadingPreviousActivities: false
    }
  },

  computed: {
    ...mapGetters('contacts', {
      contact: 'contact'
    }),
    ...mapGetters('powerDialer', {
      pdContact: 'contact'
    }),

    contactName () {
      if (this.resources && this.resources.name) {
        return _.get(this.resources, 'name', '')
      }

      if (this.resources && this.resources.first_name && this.resources.last_name) {
        return `${this.resources.first_name} ${this.resources.last_name}`
      }

      return 'No Name'
    },

    resources () {
      if (this.isContactType) {
        return this.contact
      } else {
        return this.pdContact
      }
    },

    hasUnreads () {
      return this.resources.unread_texts_count > 0 ||
        this.resources.unread_missed_calls_count > 0 ||
        this.resources.unread_voicemails_count > 0
    },
    unreadCount () {
      return this.resources.unread_texts_count + this.resources.unread_missed_calls_count + this.contact.unread_voicemails_count
    }
  },

  methods: {
    scrollMessages () {
      let activitiesWrap = this.$refs.activitiesWrap
      if (activitiesWrap && activitiesWrap.scrollHeight) {
        activitiesWrap.scrollTop = activitiesWrap.scrollHeight
      }
    },
    markAllAsRead () {
      this.$emit('markAllAsRead')
    }
  }
}
</script>
