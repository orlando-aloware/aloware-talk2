<template>
  <div>
    <!-- Desktop View -->
    <div class="d-none d-md-flex align-items-center">
      <reply-communication-button class="operation-button mx-1"
                                  :communication="row"
                                  v-if="showReplyButton"/>
      <call-communication-button class="operation-button mx-1"
                                 :communication="row"
                                 v-if="showCallButton"/>
      <details-communication-button class="operation-button mx-1"
                                    :communication="row"
                                    v-if="showDetailsButton"/>
      <archive-communication-button class="operation-button mx-1"
                                    :communication="row"
                                    v-if="showArchiveButton"/>
      <terminate-communication-button class="operation-button mx-1"
                                      :communication="row"
                                      v-if="showTerminateButton"/>
      <barge-communication-button class="operation-button mx-1"
                                  :communication="row"
                                  v-if="showBargeAndWhisperButton"/>
      <whisper-communication-button class="operation-button mx-1"
                                    :communication="row"
                                    v-if="showBargeAndWhisperButton"/>
    </div>

    <!-- Mobile View -->
    <div class="d-md-none">
      <b-dropdown class="m-2 b-compact-dropdown-button text-bold dropdown-white contacts-options-dropdown"
                  text="..."
                  variant="light"
                  no-caret
                  data-testid="lists-options-dropdown"
                  alt="Communication Operations"
                  title="Communication Operations"
                  boundary="window"
                  right
                  :popper-opts="{ positionFixed: true }"
                  @hide="onHide"
                  @show="onShow">
        <template #button-content>
          <ellipse-icon />
        </template>

        <b-dropdown-item v-if="showReplyButton">
          <reply-communication-button show-button-text
                                      :communication="row"/>
        </b-dropdown-item>
        <b-dropdown-item v-if="showCallButton">
          <call-communication-button show-button-text
                                     :communication="row"/>
        </b-dropdown-item>
        <b-dropdown-item v-if="showDetailsButton">
          <details-communication-button show-button-text
                                        :communication="row"/>
        </b-dropdown-item>
        <b-dropdown-item v-if="showArchiveButton">
          <archive-communication-button show-button-text
                                        :communication="row"/>
        </b-dropdown-item>
        <b-dropdown-item v-if="showTerminateButton">
          <terminate-communication-button show-button-text
                                          :communication="row"/>
        </b-dropdown-item>
        <b-dropdown-item v-if="showBargeAndWhisperButton">
          <barge-communication-button show-button-text
                                      :communication="row"/>
        </b-dropdown-item>
        <b-dropdown-item v-if="showBargeAndWhisperButton">
          <whisper-communication-button show-button-text
                                        :communication="row"/>
        </b-dropdown-item>
      </b-dropdown>
    </div>
  </div>
</template>

<script>
import ReplyCommunicationButton from 'components/communication/reply-communication-button.vue'
import CallCommunicationButton from 'components/communication/call-communication-button.vue'
import DetailsCommunicationButton from 'components/communication/details-communication-button.vue'
import ArchiveCommunicationButton from 'components/communication/archive-communication-button.vue'
import TerminateCommunicationButton from 'components/communication/terminate-communication-button.vue'
import BargeCommunicationButton from 'components/communication/barge-communication-button.vue'
import WhisperCommunicationButton from 'components/communication/whisper-communication-button.vue'
import EllipseIcon from 'components/icons/ellipse-icon'
import * as CommunicationTypes from 'src/constants/communication-types'
import { DISPOSITION_STATUS_INPROGRESS_NEW } from 'src/constants/communication-disposition-status'
import { aclMixin, agentMixin, communicationMixin, simpsocialMixin } from 'src/plugins/mixins'

export default {
  name: 'communications-operations',

  mixins: [
    aclMixin,
    agentMixin,
    communicationMixin,
    simpsocialMixin
  ],

  components: {
    ReplyCommunicationButton,
    CallCommunicationButton,
    DetailsCommunicationButton,
    ArchiveCommunicationButton,
    TerminateCommunicationButton,
    BargeCommunicationButton,
    WhisperCommunicationButton,
    EllipseIcon
  },

  props: {
    row: {
      type: Object,
      required: true
    }
  },

  data: () => ({
    CommunicationTypes,
    DISPOSITION_STATUS_INPROGRESS_NEW
  }),

  computed: {
    showReplyButton () {
      return this.row.type === CommunicationTypes.SMS && this.hasPermissionTo('send sms')
    },

    showCallButton () {
      return this.row.contact && this.row.type !== CommunicationTypes.EMAIL
    },

    showDetailsButton () {
      return this.row.contact_id
    },

    showArchiveButton () {
      return this.hasPermissionTo('archive communication')
    },

    showTerminateButton () {
      return this.hasRole('Company Admin') && this.row.type === CommunicationTypes.CALL && this.row.disposition_status2 === DISPOSITION_STATUS_INPROGRESS_NEW
    },

    showBargeAndWhisperButton () {
      return this.userCanBargeAndWhisper(this.row)
    }
  },

  methods: {
    onShow ({ target }) {
      const el = target.closest('td')
      el.style.zIndex = '4'
    },

    onHide (event) {
      const { target } = event
      const el = target.closest('td')
      el.style.zIndex = '0'
    }
  }
}
</script>
