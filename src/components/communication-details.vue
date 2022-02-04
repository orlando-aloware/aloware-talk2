<template>
  <div v-if="communication">
    <b-row>
      <b-col md="4"
             sm="12"
             class="pl-0">

        <q-card flat bordered class="my-card bg-grey-1">
          <q-card-section class="pb-0">
            <div class="d-flex justify-content-between">
              <div class="fs-14 mt-1">Communication Info</div>

              <div>
                <b-button variant="primary"
                          size="sm" class="mr-1">Report Issue</b-button>
                <b-button v-if="hasPermissionTo('archive communication')"
                          variant="danger"
                          size="sm"
                          @click="onArchive">
                  Archive
                </b-button>
              </div>
            </div>
            <hr/>
          </q-card-section>

          <q-card-section class="pt-0">
            <div class="text-lt p-x"
                 :class="[!communication.duration ? 'flex-grow-1 text-left' : '']">
              <component :is="stateToIcon(communication.disposition_status2, communication.type, communication.direction)"
                         v-if="communication.disposition_status2">
              </component>
              <span v-if="![CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)">
                {{ communication.direction | fixCommDirection }}
              </span>
              {{ communication.type | fixCommType }}
            </div>
          </q-card-section>

          <q-card-section>
            <div class="fs-13 my-2"
                               v-if="communication.type === CommunicationTypes.CALL">
            This call
            {{ communication.disposition_status2 === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW ? 'is' : 'was' }}
            {{ communication.disposition_status2 | translateDispositionStatusText | replaceDash }}.
          </div>

          </q-card-section>

          <q-card-section>
            <b-form-row>
              <b-col class="pl-0 pr-0">
                <q-item-label>Contact: </q-item-label>
              </b-col>
              <b-col>
                <router-link
                  :to="{ name: 'Contact', params: { id: communication.contact.id }}">
                  {{ communication.contact.name | fixContactName }}
                </router-link>

              </b-col>
            </b-form-row>
            <hr/>
            <b-form-row>
              <b-col class="pl-0 pr-0">
                <q-item-label>Disposition: </q-item-label>
              </b-col>
              <b-col>
                {{
                  communication.disposition_status2 | translateDispositionStatusText | replaceDash |
                    capitalize
                }}
              </b-col>
            </b-form-row>
            <hr/>
            <b-form-row>
              <b-col class="pl-0 pr-0">
                <q-item-label>From: </q-item-label>
              </b-col>
              <b-col>
                <div class="d-flex align-items-center"
                     v-if="communication.direction === CommunicationDirections.INBOUND && communication.type !== CommunicationTypes.EMAIL">
                  {{ communication.lead_number | fixPhone }}
                </div>
                <div class="d-flex align-items-center"
                     v-else-if="communication.direction === CommunicationDirections.INBOUND && communication.type === CommunicationTypes.EMAIL">
                  {{ communication.lead_number }}
                </div>
                <div class="d-flex align-items-center"
                     v-else-if="communication.direction === CommunicationDirections.OUTBOUND && communication.type === CommunicationTypes.EMAIL">
                  {{ communication.incoming_number }}
                </div>
                <div class="d-flex align-items-center"
                     v-else>
                  {{ getCommunicationCampaignName() }}
                  <br v-if="getCommunicationCampaignName()">
                  {{ communication.incoming_number | fixPhone }}
                </div>
              </b-col>
            </b-form-row>
          </q-card-section>
          <q-card-section>
            <b-form-row>
              <b-col class="pl-0 pr-0">
                <q-item-label>To: </q-item-label>
              </b-col>
              <b-col>
                <div class="d-flex align-items-center"
                     v-if="communication.direction === CommunicationDirections.INBOUND && communication.type !== CommunicationTypes.EMAIL">
                  {{ getCommunicationCampaignName() }}
                  <br v-if="getCommunicationCampaignName()">
                  {{ communication.incoming_number | fixPhone }}
                </div>
                <div class="d-flex align-items-center"
                     v-else-if="communication.direction === CommunicationDirections.INBOUND && communication.type === CommunicationTypes.EMAIL">
                  {{ communication.incoming_number }}
                </div>
                <div class="d-flex align-items-center"
                     v-else-if="communication.direction === CommunicationDirections.OUTBOUND && communication.type === CommunicationTypes.EMAIL">
                  {{ communication.lead_number }}
                </div>
                <div class="d-flex align-items-center"
                     v-else>
                  {{ communication.lead_number | fixPhone }}
                </div>
              </b-col>
            </b-form-row>
            <hr/>
            <b-form-row>
              <b-col class="pl-0 pr-0">
                <q-item-label>Target Users <span v-if="communication.target_users && communication.target_users.length">({{ attemptLabel }})</span>: </q-item-label>
              </b-col>
              <b-col>
                <target-users-tree class="w-100"
                                   :communication="communication"
                                   :show-label="false"/>
              </b-col>
            </b-form-row>
            <hr/>
            <b-form-row v-if="[CommunicationTypes.CALL, CommunicationTypes.SMS, CommunicationTypes.EMAIL, CommunicationTypes.NOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)">
              <b-col class="pl-0 pr-0">
                <q-item-label>User: </q-item-label>
              </b-col>
              <b-col>
                <q-icon class="status-icon d-inline-block text-danger"
                        :state="communication.rejected_by_app"
                        :name="rejectionToIcon(communication.rejected_by_app)"
                        v-if="communication.rejected_by_app !== 0">
                  <q-tooltip
                    anchor="top middle"
                    self="bottom middle"
                    max-width="150px">
                    {{ rejectionTooltipData(communication.rejected_by_app) }}
                  </q-tooltip>
                </q-icon>
                <div v-else-if="getUser(communication.user_id) && getUser(communication.user_id).id">
                  <router-link
                    :to="{ name: 'User Activity', params: {userId: communication.user_id }}">
                      <span class="text-black"
                            :title="getUserName(getUser(communication.user_id))">
                        <q-tooltip class="item"
                                   content-class="bg-grey-light11"
                                   anchor="top left"
                                   self="center middle">
                          Click For More Info
                        </q-tooltip>
                        {{ getUserName(getUser(communication.user_id)) }}
                      </span>
                  </router-link>
                </div>
                <div v-else>
                    <span class="text-greyish">
                      -
                    </span>
                </div>
              </b-col>
            </b-form-row>
            <hr/>
            <b-form-row v-if="![CommunicationTypes.EMAIL, CommunicationTypes.FAX, CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)">
              <b-col class="pl-0 pr-0">
                <q-item-label>Started at: </q-item-label>
              </b-col>
              <b-col>
                <div class="d-flex align-items-center">
                  {{ communication.created_at | fixCommunicationDateTime }}
                </div>
              </b-col>
            </b-form-row>
          </q-card-section>
          <q-card-section>
            <b-form-row>
              <b-col class="pl-0 pr-0">
                <q-item-label>Ended at: </q-item-label>
              </b-col>
              <b-col>
                <div class="d-flex align-items-center">
                  {{ communication.created_at | fixCommunicationDateTime(communication.duration) }}
                </div>
              </b-col>
            </b-form-row>
            <hr/>
            <b-form-row>
              <b-col class="pl-0 pr-0">
                <q-item-label>Duration: </q-item-label>
              </b-col>
              <b-col>
                <div class="d-flex align-items-center">
                  {{ communication.duration | fixDuration }}
                </div>
              </b-col>
            </b-form-row>
          </q-card-section>
          <q-card-section>
            <b-form-row>
              <b-col class="pl-0 pr-0">
                <q-item-label>Talk Time: </q-item-label>
              </b-col>
              <b-col>
                <div class="d-flex align-items-center">
                  {{ communication.talk_time | fixDuration }}
                </div>
              </b-col>
            </b-form-row>
            <hr/>
            <b-form-row v-if="![CommunicationTypes.SMS, CommunicationTypes.RVM, CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type) && verbose">
              <b-col class="pl-0 pr-0">
                <q-item-label>Wait Time: </q-item-label>
              </b-col>
              <b-col>
                <div class="d-flex align-items-center"
                     v-if="communication.direction === CommunicationDirections.INBOUND && communication.type !== CommunicationTypes.EMAIL">
                  {{ communication.wait_time | fixDuration }}
                </div>
              </b-col>
            </b-form-row>
            <hr/>
            <b-form-row v-if="![CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)">
              <b-col class="pl-0 pr-0">
                <q-item-label>Lines: </q-item-label>
              </b-col>
              <b-col>
                <div class="d-flex align-items-center">
                  <router-link
                    :to="{ name: 'Line Activity', params: { campaignId: communication.campaign_id }}"
                    v-if="usedCampaign">
                    <q-tooltip
                      anchor="top middle"
                      self="bottom middle"
                      max-width="150px">
                      Click for more info
                    </q-tooltip>
                    {{ usedCampaign.name }}
                  </router-link>
                  <template v-else>
                    Deleted Line
                  </template>
                </div>
              </b-col>
            </b-form-row>
          </q-card-section>
          <q-card-section>
            <b-form-row v-if="![CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)">
              <b-col class="pl-0 pr-0">
                <q-item-label>Ring Group: </q-item-label>
              </b-col>
              <b-col>
                <div class="d-flex align-items-center">
                  <router-link
                    :to="{ name: 'Ring Group Activity', params: { ringGroupId: communication.ring_group_id }}"
                    v-if="usedRingGroup">
                    <q-tooltip
                      anchor="top middle"
                      self="bottom middle"
                      max-width="150px">
                      Click for more info
                    </q-tooltip>
                    {{ usedRingGroup.name }}
                  </router-link>
                  <template v-else>
                    Deleted Ring Group
                  </template>
                </div>
              </b-col>
            </b-form-row>
          </q-card-section>
          <q-card-section>
            <b-form-row v-if="communication.type === CommunicationTypes.CALL">
              <b-col class="pl-0 pr-0">
                <q-item-label>Recording: </q-item-label>
              </b-col>
              <b-col>
                <div class="d-flex align-items-center"
                     v-if="communication.has_recording">
                  <communication-audio :communication="communication"
                                       :type="UploadedFileTypes.TYPE_CALL_RECORDING"
                                       :uniqueId="communication.id + '1'"
                                       class="mb-2">
                  </communication-audio>
                </div>
                <div class="d-flex align-items-center"
                     v-else>
                  No Call Recording
                </div>
              </b-col>
            </b-form-row>
          </q-card-section>

          <q-card-section v-if="[CommunicationTypes.CALL, CommunicationTypes.RVM].includes(communication.type)">
            <b-form-row>
              <b-col class="pl-0 pr-0">
                <q-item-label>Voicemail: </q-item-label>
              </b-col>
              <b-col>
                <div class="d-flex align-items-center"
                     v-if="communication.has_voicemail">
                  <communication-audio :communication="communication"
                                       :type="UploadedFileTypes.TYPE_CALL_VOICEMAIL"
                                       :uniqueId="communication.id + '2'"
                                       class="mb-2">
                  </communication-audio>
                </div>
                <div class="d-flex align-items-center"
                     v-else>
                 No Voicemail
                </div>
              </b-col>
            </b-form-row>
          </q-card-section>

          <q-card-section>
            <b-form-row>
              <b-col class="pl-0 pr-0">
                <q-item-label>Notes: </q-item-label>
              </b-col>
              <b-col>
                <div class="d-flex align-items-center">
                  <communication-note ref="communicationNotes"
                                      :communication="communication">
                  </communication-note>
                </div>
              </b-col>
            </b-form-row>
          </q-card-section>

          <q-card-section>
            <b-form-row>
              <b-col class="pl-0 pr-0">
                <q-item-label>Tags: </q-item-label>
              </b-col>
              <b-col>
                <div class="d-flex align-items-center">
                  <communication-tags :communication="communication"/>
                </div>
              </b-col>
            </b-form-row>
          </q-card-section>

          <q-card-section v-if="communication.type === CommunicationTypes.CALL && currentCompany && callDispositions &&  callDispositions.length > 0 && !dialerMode">
            <b-form-row>
              <b-col class="pl-0 pr-0">
                <q-item-label>Call Disposition: </q-item-label>
              </b-col>
              <b-col>
                <div class="d-flex align-items-center">
                  <call-disposition-selector :communication="communication"></call-disposition-selector>
                </div>
              </b-col>
            </b-form-row>
          </q-card-section>
        </q-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import _ from 'lodash'
import { mapState } from 'vuex'
import CommunicationInfoMixin from 'src/plugins/mixins/communication-info.mixin'
import { aclMixin, userMixin } from 'src/plugins/mixins'

import TargetUsersTree from 'components/target-users-tree'
import CommunicationAudio from 'components/communication-audio'
import CommunicationNote from 'components/communication-note'
import CommunicationTags from 'components/generic-selectors/communication-tags'
import CallDispositionSelector from 'components/call-disposition-selector'

import talk2Api from 'src/plugins/api/api'

import * as CommunicationTypes from '../constants/communication-types'
import * as CommunicationDispositionStatus from '../constants/communication-disposition-status'
import * as CommunicationDirections from '../constants/communication-direction'
import * as UploadedFileTypes from '../constants/uploaded-file-types'

export default {
  name: 'communication-details',

  components: { CallDispositionSelector, CommunicationTags, CommunicationNote, CommunicationAudio, TargetUsersTree },

  mixins: [CommunicationInfoMixin, userMixin, aclMixin],

  data () {
    return {
      activeName: false,
      CommunicationTypes,
      CommunicationDispositionStatus,
      CommunicationDirections,
      UploadedFileTypes
    }
  },

  props: {
    communication: {
      required: true
    },
    verbose: {
      required: false,
      default: false,
      type: Boolean
    },
    dialerMode: {
      required: false,
      default: false,
      type: Boolean
    }
  },

  computed: {
    ...mapState(['campaigns', 'workflows', 'broadcasts', 'ringGroups', 'currentCompany', 'callDispositions']),
    usedCampaign () {
      if (!this.communication.campaign_id) {
        return null
      }

      let communicationIncomingNumber = _.get(this.communication, 'incoming_number', null)
      if (!communicationIncomingNumber) {
        return null
      }

      let campaign = this.campaigns.find(campaign => campaign.id === this.communication.campaign_id)
      if (campaign) {
        return campaign
      }

      return null
    },

    usedRingGroup () {
      if (!this.communication.ring_group_id) {
        return null
      }
      let ringGroup = this.ringGroups.find(ringGroup => ringGroup.id === this.communication.ring_group_id)
      if (ringGroup) {
        return ringGroup
      }

      return null
    },

    attemptLabel () {
      return this.communication.attempt ? `attempt ${this.communication.attempt}` : 'no attempts'
    }
  },

  methods: {
    getCommunicationCampaignName () {
      let communicationIncomingNumber = _.get(this.communication, 'incoming_number', null)
      if (!communicationIncomingNumber) {
        return null
      }
      let campaign = this.campaigns.find(campaign => campaign.id === this.campaignId)
      if (campaign) {
        return campaign.name
      }

      return null
    },
    getCampaign (id) {
      if (!id) {
        return null
      }
      let campaign = this.campaigns.find(campaign => campaign.id === id)
      if (campaign) {
        return campaign
      }

      return null
    },

    onArchive () {
      this.$bvModal.msgBoxConfirm('Archiving communication will remove it from all reports and plots. Continue?', {
        title: 'Archive Communication',
        size: 'sm',
        buttonSize: 'sm',
        okVariant: 'warning',
        okTitle: 'Yes',
        cancelTitle: 'No',
        footerClass: 'p-2',
        hideHeaderClose: false,
        centered: true
      }).then(value => {
        if (value) {
          this.onDelete()
        }
      }).catch(err => {
        // An error occurred
        console.log(err)
      })
    },
    onDelete () {
      talk2Api.V1.communication.delete(this.communication.id).then(() => {
        this.$generalNotification('Communication has been successfully archived.', 'success')
        this.$VueEvent.fire('delete_communication', { id: this.communication.id })

        this.$router.push({
          name: 'Contact',
          params: {
            id: this.communication.contact_id
          }
        }).catch(err => {
          console.log(err)
        })
      })
    }
  }
}
</script>
