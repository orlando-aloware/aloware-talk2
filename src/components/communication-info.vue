<template>
  <div class="communication-info"
       v-if="communication">
    <q-list bordered
            class="notes-wrapper float-right"
            v-if="communication.type === CommunicationTypes.NOTE">
      <q-item>
        <q-item-section>
          <p class="text-left mb-0"
             v-html="$options.filters.nl2br(parseBody)">
          </p>
        </q-item-section>
      </q-item>
    </q-list>
    <q-list class="rounded-contact-activity"
            v-else>
      <q-expansion-item class="contact-activity"
                        ref="communicationInfoExpansionItem"
                        :class="activityExpansionClass"
                        v-model="activeName"
                        @before-show="onBeforeActivityShow"
                        @after-show="onAfterActivityShow"
                        @before-hide="onBeforeActivityHide"
                        @after-hide="onActivityHide">
        <template slot="header">
          <q-item-section class="communication-header flex-row">
            <div class="ml-3 pr-2">
              <component :is="stateToIcon(communication.disposition_status2, communication.type, communication.direction)"
                         v-if="communication.disposition_status2">
              </component>
            </div>
            <div class="text-lt p-x"
                 :class="[!communication.duration ? 'flex-grow-1 text-left' : '']">
              <span v-if="![CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)">
                {{ communication.direction | fixCommDirection }}
              </span>
              {{ communication.type | fixCommType }}
            </div>
            <q-item-section class="text-lt pl-2 text-left"
                            v-if="communication.duration">
              <span v-if="communication.type === CommunicationTypes.CALL && activityMode">
                {{ communication.duration | fixDuration }}
              </span>
            </q-item-section>
          </q-item-section>
          <q-tooltip anchor="top middle"
                     self="center middle">
            {{ communication.disposition_status2 | translateDispositionStatusText | replaceDash | capitalize }}
          </q-tooltip>
        </template>
        <div class="px-3 pt-2 pb-2 text-left"
             v-if="activeName">
          <div class="p-a b-t b-light">
            <template
              v-if="[CommunicationTypes.SMS, CommunicationTypes.EMAIL, CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)">
              <template v-for="(image, index) in communication.attachments">
                <q-img
                  class="img-fluid d-block r-2x"
                  v-if="[CommunicationTypes.SMS, CommunicationTypes.NOTE].includes(communication.type) && communication.attachments && communication.attachments.length > 0"
                  :class="index > 0 ? 'mb-1' : ''"
                  :key="index"
                  height="200px"
                  :src="image.url">
                  <template v-slot:error>
                    <div class="absolute-full flex flex-center bg-negative text-white">
                      Error!
                    </div>
                  </template>
                </q-img>
              </template>

              <div v-if="communication.body">
                <div class="text-muted mb-2"
                     v-if="![CommunicationTypes.SMS, CommunicationTypes.REMINDER, CommunicationTypes.APPOINTMENT].includes(communication.type)"
                     v-html="$options.filters.nl2br(parseBody)"
                     v-linkify:options="{ target: '_blank' }">
                </div>
                <div class="font-weight-light-bold my-2"
                     v-else-if="communication.type === CommunicationTypes.APPOINTMENT">
                  Appointment has been set
                </div>
                <div class="font-weight-light-bold my-2"
                     v-else-if="communication.type === CommunicationTypes.REMINDER">
                  Reminder has been set
                </div>
                <span class="text-muted"
                      v-else
                      v-linkify:options="{ target: '_blank' }">
                  <span v-html="parseBody"></span>
                </span>
              </div>
            </template>

            <div class="font-weight-light-bold my-2"
                 v-if="communication.type === CommunicationTypes.CALL">
              This call
              {{ communication.disposition_status2 === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW ? 'is' : 'was' }}
              {{ communication.disposition_status2 | translateDispositionStatusText | replaceDash }}.
            </div>

            <div class="w-100"
                 v-if="[CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)">
              <div class="form-group row mb-0 pt-2 pb-2">
                <div class="d-flex align-items-center w-100"
                     v-if="communication.type === CommunicationTypes.APPOINTMENT">
                  <div class="w-75">
                    <label class="form-control-label w-100 mb-1">Date</label>
                    {{ communication.engagement_data.appointment_datetime | fixScheduleDate }}
                  </div>
                  <div class="w-35">
                    <label class="form-control-label w-100 mb-1">Time</label>
                    {{ communication.engagement_data.appointment_datetime | fixScheduleTime }}
                  </div>
                </div>
                <div class="d-flex align-items-center w-100"
                     v-if="communication.type === CommunicationTypes.REMINDER">
                  <div class="w-75">
                    <label class="form-control-label w-100 mb-1">Date</label>
                    {{ communication.engagement_data.reminder_datetime | fixScheduleDate }}
                  </div>
                  <div class="w-35">
                    <label class="form-control-label w-100 mb-1">Time</label>
                    {{ communication.engagement_data.reminder_datetime | fixScheduleTime }}
                  </div>
                </div>
              </div>
            </div>

            <div class="w-100 pt-2 d-flex flex-row pb-2 mb-2 border-bottom"
                 v-if="(verbose || activityMode) && ![CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)">
              <div class="w-50">
                <div class="form-group row mb-0">
                  <div class="w-100">
                    <label class="form-control-label w-100">From</label>
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
                  </div>
                </div>
              </div>

              <div class="w-50">
                <div class="w-100">
                  <div class="form-group row mb-0">
                    <label class="form-control-label w-100">To</label>
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
                  </div>
                </div>
              </div>
            </div>

            <div class="mb-2 pb-2 border-bottom d-flex"
                 v-if="communication.type === CommunicationTypes.CALL">
              <div class="w-100"
                   v-if="communication.direction === CommunicationDirections.INBOUND && getRingGroup(communication.ring_group_id)">
                <label class="form-control-label mb-1">Ring Group</label>
                <router-link
                  :to="{ name: 'Ring Group Activity', params: { ring_group_id: communication.ring_group_id }}"
                  v-if="getRingGroup(communication.ring_group_id)">
                  <q-tooltip anchor="top left"
                             self="top left">
                    Click For More Info
                    <span class="text-dark-greenish">
                          {{ getRingGroup(communication.ring_group_id, true) }}
                        </span>
                  </q-tooltip>
                </router-link>
                <target-users-tree class="w-100"
                                   :communication="communication"
                                   :is-form="true"/>
              </div>
            </div>
            <div class="mb-2 pb-2 border-bottom d-flex"
                 v-if="communication.type === CommunicationTypes.CALL">
              <div class="w-100">
                <label class="form-control-label w-100">
                  {{ communication.direction === CommunicationDirections.INBOUND ? 'Answered By' : 'Initiated By' }}
                </label>
                <div class="d-flex align-items-center w-100">
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
                      {{ communication.direction === CommunicationDirections.INBOUND ? 'Not Answered' : 'Not Initiated' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="w-100 mb-2 pb-2 border-bottom"
                 v-if="[CommunicationTypes.SMS, CommunicationTypes.EMAIL, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)">
              <div class="w-100 mb-0 pt-2 pb-2">
                <label class="form-control-label w-100 mb-1">User</label>
                <div class="d-flex align-items-center w-100">
                  <div class="status-icon d-inline-block"
                       :state="communication.rejected_by_app"
                       v-if="communication.rejected_by_app !== 0"
                       v-html="rejectionToIcon(communication.rejected_by_app)">
                    <q-tooltip anchor="bottom middle"
                               self="top middle">
                      {{ rejectionTooltipData(communication.rejected_by_app) }}
                    </q-tooltip>
                  </div>

                  <q-tooltip class="item"
                             content-class="bg-grey-light11"
                             anchor="top middle"
                             self="top middle"
                             v-if="communication.rejected_by_app !== 0">
                    {{ rejectionTooltipData(communication.rejected_by_app) }}
                    <component class="status-icon d-inline-block"
                               v-bind:is="icon"
                               :name="rejectionToIcon(communication.rejected_by_app)">
                    </component>
                  </q-tooltip>
                  <div v-else-if="getUser(communication.user_id) && getUser(communication.user_id).id">
                    <router-link
                      :to="{ name: 'User Activity', params: {userId: communication.user_id }}">
                      <span class="text-black"
                            :title="getUserName(getUser(communication.user_id))">
                        <q-tooltip class="item"
                                   content-class="bg-grey-light11"
                                   anchor="top left"
                                   self="center left">
                          Click For More Info
                        </q-tooltip>
                        {{ getUserName(getUser(communication.user_id)) }}
                      </span>
                    </router-link>
                  </div>
                  <div v-else>
                    <span class="text-greyish">-</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-horizontal b-b"
                 v-if="communication.type === CommunicationTypes.CALL && communication.attempting_users && communication.attempting_users.length > 0 && verbose">
              <div class="form-group row mb-0 pt-2 pb-2">
                <label class="form-control-label w-100 mb-1">Attempting Users:</label>
                <div class="d-flex align-items-center w-100">
                  <span class="text-greyish">
                      <ul class="list list-unstyled inset mb-0">
                        <template v-for="(attemptingUser, index) in communication.attempting_users">
                            <li :key="attemptingUser + '-user-' + index"
                                v-if="getUser(attemptingUser) && getUser(attemptingUser).id"
                                class="pb-1">
                                <router-link
                                  :to="{ name: 'User Activity', params: {userId: getUser(attemptingUser).id }}">
                                    <span :class="getAttemptingClass(attemptingUser, communication.disposition_status2, communication.user_id)"
                                          :title="getUserName(getUser(attemptingUser))">
                                        {{ getUserName(getUser(attemptingUser)) }}
                                    </span>
                                </router-link>
                            </li>
                        </template>
                      </ul>
                  </span>
                </div>
              </div>
            </div>

            <div class="pb-2 mb-2 border-bottom"
                 v-if="![CommunicationTypes.EMAIL, CommunicationTypes.FAX, CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)">
              <div class="d-flex flex-row w-100"
                   v-if="communication.type === CommunicationTypes.CALL">
                <div class="w-50">
                  <label class="form-control-label mb-1">
                    Started at:
                  </label>
                  <div class="d-flex align-items-center">
                    {{ communication.created_at | fixCommunicationDateTime }}
                  </div>
                </div>
                <div class="w-50">
                  <label class="form-control-label mb-1">Duration:</label>
                  <div class="d-flex align-items-center">
                    {{ communication.duration | fixDuration }}
                  </div>
                </div>
              </div>
              <div class="form-group row mb-0"
                   v-if="communication.type === CommunicationTypes.SMS">
                <label class="form-control-label w-100 mb-1">
                  Sent at:
                </label>
                <div class="d-flex align-items-center w-100">
                  {{ communication.created_at | fixCommunicationDateTime }}
                </div>
              </div>
            </div>

            <div class="form-horizontal b-b"
                 v-if="communication.type === CommunicationTypes.SMS">
              <div class="form-group row mb-0">
                <label class="form-control-label w-100 mb-1">
                  Current Status:
                </label>
                <div class="d-flex align-items-center w-100">
                  {{
                    communication.current_status2 !== CommunicationCurrentStatus.CURRENT_STATUS_COMPLETED_NEW ?
                      $options.filters.translateCurrentStatusText(communication.current_status2) :
                      $options.filters.translateDispositionStatusText(communication.disposition_status2) | replaceDash |
                      capitalize
                  }}
                </div>
              </div>
            </div>

            <div class="form-horizontal b-b"
                 v-if="communication.type === CommunicationTypes.CALL && verbose">
              <div class="form-group row mb-0">
                <label class="form-control-label w-100 mb-1">Ended at:</label>
                <div class="d-flex align-items-center w-100">
                  {{ communication.created_at | fixCommunicationDateTime(communication.duration) }}
                </div>
              </div>
            </div>

            <div class="form-horizontal"
                 v-if="(communication.type === CommunicationTypes.SMS) && verbose">
              <div class="form-group row mb-0">
                <label class="form-control-label w-100 mb-1">Parts:</label>
                <div class="d-flex align-items-center w-100">
                  {{ communication.duration }}
                </div>
              </div>
            </div>

            <div class="form-horizontal b-b"
                 v-if="![CommunicationTypes.SMS, CommunicationTypes.RVM, CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type) && verbose">
              <div class="form-group row mb-0">
                <label class="form-control-label w-100 mb-1">Wait time:</label>
                <div class="d-flex align-items-center">
                  <span v-if="communication.disposition_status2 == CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED_NEW">{{ communication.wait_time | fixDuration }}</span>
                  <span v-else>-</span>
                </div>
              </div>
            </div>

            <div class="form-horizontal pt-1 mb-3 pb-2 border-bottom"
                 v-if="[CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)">
              <label class="form-control-label mb-1">Notes</label>
              <div class="d-flex flex-column justify-content-center pb-2 w-100"
                   v-if="communication.type === CommunicationTypes.APPOINTMENT && communication.engagement_data.appointment_note">
                {{ communication.engagement_data.appointment_note }}
              </div>
              <div class="d-flex flex-column justify-content-center pb-2 w-100"
                   v-else-if="communication.type === CommunicationTypes.REMINDER && communication.engagement_data.reminder_note">
                {{ communication.engagement_data.reminder_note }}
              </div>
              <div class="d-flex flex-column justify-content-center pb-2 w-100"
                   v-else>
                -
              </div>
            </div>

            <div class="w-100 text-center pb-2"
                 :class="[hasSMSReminder ? 'mb-2 border-bottom' : '']"
                 v-if="[CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)">
              <div class="text-center pb-1 b-b">
                <q-btn-toggle
                  class="border w-100"
                  no-caps
                  dense
                  unelevated
                  toggle-color="primary"
                  color="white"
                  text-color="primary"
                  :options="appointmentOptions"
                  :disabled="loadingUpdateEngagement"
                  v-model="communication.disposition_status2"
                  v-if="communication.type === CommunicationTypes.APPOINTMENT"
                  @click="changeEngagementStatus"
                />
                <q-btn-toggle
                  class="border w-100"
                  no-caps
                  dense
                  unelevated
                  toggle-color="primary"
                  color="white"
                  text-color="primary"
                  :options="reminderOptions"
                  :disabled="loadingUpdateEngagement"
                  v-model="communication.disposition_status2"
                  v-else
                  @click="changeEngagementStatus"/>
              </div>
            </div>

            <div class="form-horizontal"
                 v-if="![CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)">
              <div class="form-group row mb-0">
                <div class="w-100"
                     v-if="communication.type === CommunicationTypes.CALL">
                  <label class="form-control-label"
                         v-if="communication.has_recording">
                    Call Recording
                  </label>
                  <div class="d-flex align-items-center w-100 mb-2 border-bottom"
                       v-if="communication.has_recording">
                    <communication-audio :communication="communication"
                                         :type="UploadedFileTypes.TYPE_CALL_RECORDING"
                                         :uniqueId="communication.id + '1'"
                                         class="mb-2"
                                         v-if="activeName">
                    </communication-audio>
                  </div>
                  <div class="form-control-label w-100 mb-2 pb-2 border-bottom"
                       v-else>
                    No Call Recording
                  </div>
                </div>

                <div class="w-100"
                     v-if="[CommunicationTypes.CALL, CommunicationTypes.RVM].includes(communication.type)">
                  <label class="form-control-label w-100"
                         v-if="communication.has_voicemail">
                    Voicemail
                  </label>
                  <div class="d-flex flex-row align-items-center w-100 mb-2 border-bottom"
                       v-if="communication.has_voicemail">
                    <communication-audio :communication="communication"
                                         :type="UploadedFileTypes.TYPE_CALL_VOICEMAIL"
                                         :uniqueId="communication.id + '2'"
                                         class="mb-2"
                                         v-if="activeName">
                    </communication-audio>
                  </div>
                  <div class="form-control-label w-100 mb-2 pb-2 border-bottom"
                       v-else>
                    No Voicemail
                  </div>
                </div>

                <template v-if="[CommunicationTypes.FAX, CommunicationTypes.EMAIL].includes(communication.type) && communication.attachments && communication.attachments.length > 0">
                  <div class="border-bottom pb-2 mb-2 w-100">
                    <label class="form-control-label w-100 mb-1">
                      Files:
                    </label>
                    <div class="d-flex align-items-center w-100">
                      <span v-for="(attachment, index) in communication.attachments"
                            :key="index"
                            class="text-dark-greenish">
                        <a class="text-dark-greenish"
                           target="_blank"
                           :href="attachment.url">
                          Click Here To Download
                        </a>
                      </span>
                    </div>
                  </div>
                </template>

                <label class="form-control-label w-100 mb-1">Tags</label>
                <div class="d-flex align-items-center w-100 pb-2 mb-2 border-bottom">
                  <communication-tags :communication="communication"/>
                </div>

                <label class="form-control-label mb-1">Notes</label>
                <div class="d-flex flex-column justify-content-center pb-2 w-100">
                  <communication-note ref="communicationNotes"
                                      :communication="communication">
                  </communication-note>
                </div>

                <template
                  v-if="communication.type === CommunicationTypes.CALL && currentCompany && callDispositions &&  callDispositions.length > 0 && !dialerMode">
                  <div class="d-flex align-items-center co-12">
                    <label class="form-control-label mb-1">Call Disposition:</label>
                    <label class="ml-1 d-flex align-items-center"
                           v-if="currentCompany.force_call_disposition">
                      <b-button id="audio-btn"
                                size="sm"
                                variant="link"
                                class="p-0">
                        <q-icon name="info"
                                class="text-danger">
                        </q-icon>
                      </b-button>
                      <b-popover target="audio-btn"
                                 triggers="focus"
                                 placement="right"
                                 delay="100">
                        Your account admin as mandated call dispositions.
                      </b-popover>
                    </label>
                  </div>
                  <div class="d-flex align-items-center pt-2 w-100">
                    <call-disposition-selector :communication="communication"></call-disposition-selector>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <div class="w-100"
               v-if="[CommunicationTypes.APPOINTMENT].includes(communication.type)">
            <div>
              <div class="d-flex flex-row w-100 align-items-start"
                   :class="[communication.type === CommunicationTypes.REMINDER ? 'text-left' : 'justify-center']">
                <!--router-link class="pt-3"
                             :class="[communication.type === CommunicationTypes.REMINDER ? 'w-100' : 'w-50']"
                             :to="{ name: 'Calendar', query: { communicationId: communication.id, view: 'month' }}">
                  <q-btn class="border"
                         no-caps
                         outlined
                         unelevated
                         size="md">
                    <div class="h-100 d-flex flex-row align-items-center mx-1 text-black font-weight-light-bold px-1">
                      <calendar-icon height="14"
                                     width="14"
                                     class="mr-1">
                      </calendar-icon>
                      Open in Calendar
                    </div>
                  </q-btn>
                </router-link-->
                <sms-reminders ref="sms-reminder"
                               v-if="communication.type === CommunicationTypes.APPOINTMENT"
                               class="d-flex flex-row justify-content-center w-100"
                               :communicationId="communication.id"
                               :campaignId="campaignId"
                               :appointmentDatetime="communication.engagement_data.appointment_datetime">
                </sms-reminders>
              </div>
            </div>
          </div>

          <div class="row p-l p-r"
               v-if="![CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type) && activityMode">
            <div class="col-12 text-center">
              <router-link
                :to="{ name: 'Communication', params: {communicationId: communication.id}}">
                <button class="more-details font-weight-light-bold btn btn-sm">
                  More Details
                  <chevron-right width="5"
                                 height="8">
                  </chevron-right>
                </button>
              </router-link>
            </div>
          </div>
        </div>
      </q-expansion-item>
    </q-list>
    <div class="px-3 pt-2 bottom-radius border-no-top text-left bg-white notes-body"
         v-if="communication.notes && !activeName && communication.type !== CommunicationTypes.NOTE">
      <label class="form-control-label mb-1 text-left">Note</label>
      <p class="text-left"
         v-html="$options.filters.nl2br(communication.notes)">
      </p>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import { aclMixin, avatarMixin, communicationInfoMixin, dateMixin, userMixin } from 'src/plugins/mixins'
import { mapState } from 'vuex'
import SmsReminders from './sms-reminders'
import TargetUsersTree from './target-users-tree'
import ChevronRight from 'components/icons/contact-activity/chevron-right'
import CommunicationAudio from 'components/communication-audio'
import CommunicationNote from 'components/communication-note'
import CommunicationTags from 'components/generic-selectors/communication-tags'
import CallDispositionSelector from 'components/call-disposition-selector'
import CalendarIcon from 'components/icons/calendar-icon'
import * as AnswerTypes from '../constants/answer-types'
import * as CommunicationCurrentStatus from '../constants/communication-current-status'
import * as CommunicationDispositionStatus from '../constants/communication-disposition-status'
import * as CommunicationTypes from '../constants/communication-types'
import * as CommunicationDirections from '../constants/communication-direction'
import * as UploadedFileTypes from '../constants/uploaded-file-types'

export default {
  name: 'communication-info',

  mixins: [
    aclMixin,
    avatarMixin,
    communicationInfoMixin,
    dateMixin,
    userMixin
  ],

  components: {
    CalendarIcon,
    ChevronRight,
    CallDispositionSelector,
    CommunicationAudio,
    CommunicationNote,
    CommunicationTags,
    SmsReminders,
    TargetUsersTree
  },

  props: {
    communication: {
      required: true
    },

    contact: {
      required: false
    },

    verbose: {
      required: false,
      default: false,
      type: Boolean
    },

    displayContact: {
      required: false,
      default: false,
      type: Boolean
    },

    activityMode: {
      required: false,
      default: false,
      type: Boolean
    },

    dialerMode: {
      required: false,
      default: false,
      type: Boolean
    },

    hideContactDisposition: {
      required: false,
      default: false,
      type: Boolean
    },

    isWidget: {
      required: false,
      default: false,
      type: Boolean
    },

    campaignId: {
      required: false
    }
  },

  data () {
    return {
      loadingDispose: false,
      REJECTION_REASON_CREDITS: 1, // A call/SMS was received by our system but not shown to user because company was out of credit
      REJECTION_REASON_BLOCKED: 2, // A call/SMS was received by our system but was blocked because caller's phone number is blocked.
      REJECTION_REASON_OTHER: 3, // A call/SMS was received by our system but was blocked because because of other reasons, e.g.: .
      REJECTION_REASON_USER_NOT_FOUND: 4, // A call/SMS was received by our system but it doesn't have a user
      REJECTION_REASON_FAILED: 5, // A call/SMS was failed
      activeName: false,
      loadingUpdateEngagement: false,
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      appointmentOptions: [
        {
          label: 'Set',
          value: CommunicationDispositionStatus.DISPOSITION_STATUS_APPOINTMENT_SET
        },
        {
          label: 'Attended',
          value: CommunicationDispositionStatus.DISPOSITION_STATUS_APPOINTMENT_ATTENDED
        },
        {
          label: 'Cancelled',
          value: CommunicationDispositionStatus.DISPOSITION_STATUS_APPOINTMENT_CANCELED
        }
      ],
      reminderOptions: [
        {
          label: 'Pending',
          value: CommunicationDispositionStatus.DISPOSITION_STATUS_PLACED_NEW
        },
        {
          label: 'Completed',
          value: CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED_NEW
        },
        {
          label: 'Cancelled',
          value: CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW
        }
      ],
      activityExpansionClass: [],
      AnswerTypes,
      CommunicationDirections,
      CommunicationCurrentStatus,
      CommunicationDispositionStatus,
      CommunicationTypes,
      UploadedFileTypes
    }
  },

  computed: {
    ...mapState(['campaigns', 'workflows', 'broadcasts', 'ringGroups', 'currentCompany', 'callDispositions']),

    hasSMSReminder () {
      if (this.$refs['sms-reminder']) {
        return this.$refs['sms-reminder'].showSendSmsReminderButton()
      }
      return false
    },

    hasNotes () {
      return (this.communication.notes ||
        (this.communication.body &&
          this.communication.type === CommunicationTypes.NOTE))
    },
    parseBody () {
      if (this.communication.type === CommunicationTypes.NOTE) {
        return this.$options.filters.parseMentionToView(this.communication.body)
      }

      return this.communication.body
    }
  },

  created () {
    this.onActivityHide()
  },

  methods: {
    onBeforeActivityShow () {
      this.activityExpansionClass = ['activity-expanded']
    },

    onAfterActivityShow () {
      this.activityExpansionClass.push('expand-animation-finished')
    },

    onBeforeActivityHide () {
      if (this.hasNotes) {
        this.activityExpansionClass = ['activity-unexpanded collapsed-has-notes']
      }
    },

    onActivityHide () {
      let activityClass = 'activity-unexpanded'
      if (this.hasNotes) {
        activityClass += ' collapsed-has-notes'
      }
      this.activityExpansionClass = [activityClass]
    },

    getCampaign (id) {
      if (!id) {
        return null
      }
      let found = this.campaigns.find(campaign => campaign.id === id)
      if (found) {
        return found
      }

      return null
    },

    getCommunicationCampaignName () {
      let communicationIncomingNumber = _.get(this.communication, 'incoming_number', null)
      if (!communicationIncomingNumber) {
        return null
      }
      let found = this.campaigns.find(campaign => campaign.id === this.campaignId)
      if (found) {
        return found.name
      }

      return null
    },

    getRingGroup (id, getName = false) {
      if (!id) {
        return getName ? '' : null
      }
      let found = this.ringGroups.find(ringGroup => ringGroup.id === id)
      if (found) {
        return getName ? found.name : found
      }

      return getName ? '' : null
    },

    getWorkflow (id) {
      if (!id) {
        return null
      }
      let found = this.workflows.find(workflow => workflow.id === id)
      if (found) {
        return found
      }

      return null
    },

    getBroadcast (id) {
      if (!id) {
        return null
      }
      let found = this.broadcasts.find(broadcast => broadcast.id === id)
      if (found) {
        return found
      }

      return null
    },

    dispose (dispositionStatus) {
      this.loadingDispose = true
      this.$axios.post(`/api/v1/contact/${this.communication.contact_id}/dispose`, { dispositionStatus }).then((res) => {
        this.loadingDispose = false
        this.$generalNotification('Contact disposed')
        this.communication.contact.disposition_status_id = res.data.disposition_status_id
      }).catch((err) => {
        this.loadingDispose = false
        this.$handleErrors(err.response)
      })
    },

    changeEngagementStatus (event) {
      let params = {
        status: this.communication.disposition_status2
      }

      this.loadingUpdateEngagement = true
      this.$axios.post(`/api/v1/contact/${this.communication.contact_id}/${this.communication.id}/update-engagement`, params).then(res => {
        this.loadingUpdateEngagement = false
        this.$generalNotification('Engagement updated.')
        this.$emit('update', res.data)
      }).catch(err => {
        this.loadingUpdateEngagement = false
        this.$handleErrors(err.response)
      })
    },

    callDisposed (callDispositionId) {
      if (typeof callDispositionId !== 'undefined') {
        this.communication.call_disposition_id = callDispositionId
      }
      this.$emit('callDisposed')
    },

    contactDisposed (dispositionStatusId) {
      if (typeof dispositionStatusId !== 'undefined') {
        this.communication.contact.disposition_status_id = dispositionStatusId
      }
      if (this.communication.contact.disposition_status_id) {
        this.$emit('contactDisposed')
      } else {
        this.$emit('contactNotDisposed')
      }
    }
  },

  watch: {
    hasNotes () {
      if (this.hasNotes && !this.activeName) {
        this.onActivityHide()
      }
    }
  }
}
</script>
