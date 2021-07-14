<template>
  <div class="contact-activity-container">
    <contact-activities-header :label="contactName"/>
    <div class="contact-activities">
      <div class="inner-1">
        <div class="p-3  inner-2">
          <div class="d-flex flex-row w-100 pb-3 justify-content-center align-items-center">
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
import ContactActivitiesHeader from 'pages/contacts/_components/contact-activities-header'
import { mapGetters } from 'vuex'
import ContactActivity from 'pages/contacts/_components/contacts-view/contact-activity'
import MessageComposer from 'pages/contacts/_components/message-composer/message-composer'

export default {
  name: 'contact-activities',
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
      contactName: 'Contact Name',
      isLoadingPreviousActivities: false
    }
  },
  computed: {
    ...mapGetters('contacts', [ 'contact', 'listItems', 'selectedList' ])
  },
  created () {
    this.updateContactName()
  },
  methods: {
    updateContactName () {
      const listId = _.get(this.selectedList, 'id', null)
      const contactId = parseInt(_.get(this.$route, 'params.id', null))
      const contactListItems = _.get(this.listItems, `${listId}.data`, null)
      if (contactListItems) {
        const contact = contactListItems.find(contact => contact.id === contactId)
        this.contactName = _.get(contact, 'name', 'Contact Name')
        return
      }
      this.contactName = 'Contact Name'
    }
  },
  components: {
    MessageComposer,
    ContactActivitiesHeader,
    ContactActivity
  },
  watch: {
    listItems: {
      deep: true,
      handler: function () {
        this.updateContactName()
      }
    },
    '$routes.params.id': function () {
      this.updateContactName()
    }
  }
}
</script>

<style lang="scss" scoped>

  .contact-activity-container {
    display: table;
    table-layout: fixed;
    border-spacing: 0;
    width: 100%;
    height: 100%;
    margin-right: 10px;
    background-color: #fff;
    position: relative;

    .contact-activities {
      height: 100%;
      display: table-row;
      flex-direction: column;
      flex-grow: 1;

      .inner-1 {
        position: relative;
        height: 100%;
        width: 100%;

        .inner-2 {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          overflow: auto;
          -webkit-overflow-scrolling: touch;
        }
      }
    }

    .composer-container-wrapper {
      width: 100%;
    }
  }
</style>
