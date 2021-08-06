<template>
  <div class="contact-activity-container w-100">
    <contact-activities-header :label="contactName"/>
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
                            :contact="contact"
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
import contactMixins from 'src/plugins/mixins/contact.mixin'
import ContactActivitiesHeader from 'src/components/contacts/contact-activities-header'
import ContactActivity from 'src/components/contacts/contact-activity'
import MessageComposer from 'src/components/message-composer/message-composer'

export default {
  name: 'contact-activities',

  mixins: [contactMixins],

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
    }
  },

  data () {
    return {
      isLoadingPreviousActivities: false
    }
  },

  computed: {
    ...mapGetters('contacts', ['contact']),

    contactName () {
      return _.get(this.contact, 'name', '')
    }
  },

  methods: {
    scrollMessages () {
      let activitiesWrap = this.$refs.activitiesWrap
      if (activitiesWrap && activitiesWrap.scrollHeight) {
        activitiesWrap.scrollTop = activitiesWrap.scrollHeight
      }
    },

    scrollIntoActivity () {
      console.log('scroll now')
    }
  }
}
</script>
