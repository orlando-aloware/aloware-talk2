<template>
  <div class="task-item w-100 d-flex flex-row py-2 pr-2 align-items-center border-bottom mb-1">
    <div class="avatar d-flex justify-content-center pb-1"
         role="button">
      <avatar width="34"
              height="34"
              :sequenceIcon="communication.direction === CommunicationDirection.OUTBOUND && communication.workflow_id"
              :style="avatarStyle(false)"
              :name="communication.contact.name">
      </avatar>
    </div>
    <div class="task-details flex-grow-1 pb-1"
         role="button">
      <div class="contact-name">
        {{ communication.contact.name }}
      </div>
      <div class="d-flex flex-row">
        <div class="pr-2">
          <component :is="stateToIcon(communication.disposition_status2, communication.type, communication.direction)"
                     height="18px"
                     width="18px">
          </component>
        </div>
        <div class="comm-label text-grey-90 d-flex align-items-center">
          <span v-if="communication.type !== CommunicationTypes.SMS">
            {{ communication.direction | fixCommDirection }} {{ communication.type | fixCommType }}
          </span>
          <span v-if="communication.body !== null">
            {{ communication.body | truncate(22) }}
          </span>
        </div>
      </div>
      <div class="campaign-name text-grey-10">
        {{ campaignName }}
      </div>
    </div>
    <div class="actions text-right pb-1">
      <span class="time-passed text-grey-90 mr-2"
            role="button"
            v-if="communication.current_status2 === CommunicationCurrentStatus.CURRENT_STATUS_COMPLETED_NEW">
          {{ communication.created_at | shortDateTimePassed }}
      </span>
      <div class="time-passed text-grey-90 d-flex flex-row justify-center"
            v-else>
        <div  class="px-2">
          <cancel-call-icon role="button"/>
        </div>
        <div  class="px-2">
          <accept-call-icon role="button"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import {
  avatarMixin,
  communicationInfoMixin
} from 'src/plugins/mixins'
import * as CommunicationDirection from 'src/constants/communication-direction'
import * as CommunicationDispositionStatus from 'src/constants/communication-disposition-status'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import * as CommunicationTypes from 'src/constants/communication-types'
import Avatar from 'src/components/avatar'
import { mapState } from 'vuex'
import CancelCallIcon from 'components/icons/cancel-call-icon'
import AcceptCallIcon from 'components/icons/accept-call-icon'
export default {
  name: 'task-item',
  mixins: [
    avatarMixin,
    communicationInfoMixin
  ],
  components: { AcceptCallIcon, CancelCallIcon, Avatar },
  props: {
    communication: {
      required: true
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
    ...mapState(['campaigns']),
    campaignName () {
      if (_.isEmpty(this.campaigns) || !this.communication.campaign_id) {
        return '-'
      }
      const found = this.campaigns.find(campaign => campaign.id === this.communication.campaign_id)
      const index = found ? this.campaigns.indexOf(found) : null
      if (index) {
        return this.campaigns[index].name
      }
      return '-'
    }
  }
}
</script>
