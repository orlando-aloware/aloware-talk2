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

    <q-list v-else-if="(communication.type === CommunicationTypes.CALL && communication.direction === CommunicationDirections.INBOUND && isLiveCall && !communication.callback_status) || isCallFishingMode"
            bordered
            class="rounded-contact-activity b-radius-12"
            :class="[isActiveCall ? 'call-connected cursor-pointer' : '', isActiveCall || isIncomingLiveCall || isCallFishingMode ? 'cursor-pointer' : '']"
            @click="onShowPhone">
      <q-item class="communication-header flex-row">
        <div class="ml-3 pr-2">
          <component :is="stateToIcon(communication.disposition_status2, communication.type, communication.direction, communication.callback_status)"
                     v-if="communication.disposition_status2">
          </component>
        </div>
        <div class="text-lt p-x"
             :class="[!communication.duration ? 'flex-grow-1 text-left' : '']">
            <span v-if="![CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type) && !isActiveCall && !isParkedCall">
              {{ communication.direction | fixCommDirection }}
              {{ communication.type | fixCommType }}
            </span>
            <span v-else-if="isParkedCall">Parked Call</span>
            <span v-else class="call-connected-text">Connected</span>
        </div>
        <q-item-section class="text-lt pl-2 text-left"
                        v-if="communication.duration && isParkedCall">
            <span v-if="communication.type === CommunicationTypes.CALL && activityMode">
              {{ communication.duration | fixDuration }}
            </span>
        </q-item-section>
        <q-item-section class="text-lt pl-2 pr-2 text-left">
          <!-- Incoming Call-->
          <div class="text-grey-90 d-flex flex-row justify-center"
               v-if="shouldShowIncomingCallMenu">
            <div class="pl-0">
              <b-button variant="light"
                        size="sm"
                        class="bg-transparent no-border no-box-shadow p-0"
                        v-if="isShowIgnoreCallIcon || isShowCancelCallIcon"
                        @click="onRejectCall">
                <ignore-call-icon v-if="isShowIgnoreCallIcon"
                                  height="24"
                                  width="24"/>
                <q-tooltip anchor="top middle"
                           self="center middle">
                  {{ isShowIgnoreCallIcon ? 'Ignore' : 'Decline' }}
                </q-tooltip>
                <cancel-call-icon v-if="isShowCancelCallIcon"/>
              </b-button>
            </div>
            <div class="pl-1 pr-0"
                 v-if="isCallFishingMode || (!isCallFishingMode && isIncomingLiveCall)">
              <b-button variant="light"
                        size="sm"
                        class="bg-transparent no-border no-box-shadow p-0"
                        @click="onAcceptCall">
                <q-tooltip anchor="top middle"
                           self="center middle"
                           v-if="!showIncomingCallMenu">
                  Answer
                </q-tooltip>
                <accept-call-icon/>
              </b-button>
            </div>
          </div>

          <!-- Answered / In Progress Call-->
          <div class="text-grey-90 d-flex flex-row justify-center"
               v-if="shouldShowAnsweredCallMenu">
            <div class="pl-0">
              <b-button variant="light"
                        size="sm"
                        class="bg-transparent no-border no-box-shadow p-0"
                        @click="onHangUpCall">
                <q-tooltip anchor="top middle"
                           self="center middle">
                  Hang up
                </q-tooltip>
                <cancel-call-icon/>
              </b-button>
            </div>
          </div>

          <!-- Parked Call-->
          <div class="text-grey-90 d-flex flex-row justify-center"
               v-if="shouldShowParkedCallMenu">
            <b-button variant="light"
                      size="sm"
                      class="bg-transparent no-border no-box-shadow p-0"
                      @click="onUnparkCall">
              <q-tooltip anchor="top middle"
                         self="center middle"
                         v-if="!showParkedCallMenu">
                Unpark
              </q-tooltip>
              <parked-call-icon/>
            </b-button>
          </div>
        </q-item-section>
      </q-item>
      <q-menu v-if="isDialerConnected"
              fit
              content-class="live-call-options"
              anchor="top right"
              self="top left"
              v-model="showIncomingCallMenu"
              :offset="[5, -4]"
              @hide="showIncomingCallMenu = false">
        <q-list>
          <q-item clickable
                  v-close-popup
                  @click="onParkCurrentCallAndAnswer">
            <q-item-section class="d-inline-flex">
              <park-call-icon color="#9B51E0"
                              class="park-call-icon"
                              width="11.7"
                              height="12.35"></park-call-icon>
              <span>Park Current Call &amp; Answer</span>
            </q-item-section>
          </q-item>
          <q-item clickable
                  v-close-popup
                  @click="onHangUpCurrentCallAndAnswer">
            <q-item-section>
              <hangup-icon  width="16"
                            height="16"
                            class="hangup-icon"></hangup-icon>
              <span>Hang up Current Call &amp; Answer</span>
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
      <q-menu v-if="isDialerConnected"
              fit
              content-class="live-call-options"
              anchor="top right"
              self="top left"
              v-model="showParkedCallMenu"
              :offset="[5, -4]"
              @hide="showParkedCallMenu = false">
        <q-list>
          <q-item clickable
                  v-close-popup
                  @click="onParkCurrentCallAndConnect">
            <q-item-section class="d-inline-flex">
              <park-call-icon color="#9B51E0"
                              class="park-call-icon"
                              width="11.7"
                              height="12.35"></park-call-icon>
              <span>Park Current Call &amp; Connect</span>
            </q-item-section>
          </q-item>
          <q-item clickable
                  v-close-popup
                  @click="onHangupCurrentCallAndConnect">
            <q-item-section>
              <hangup-icon  width="16"
                            height="16"
                            class="hangup-icon"></hangup-icon>
              <span>Hang up Current Call &amp; Connect</span>
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
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
              <component :is="stateToIcon(communication.disposition_status2, communication.type, communication.direction, communication.callback_status)"
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
            {{ $options.filters.translateDispositionStatusText(communication.disposition_status2, communication.callback_status) | replaceDash | capitalize }}
          </q-tooltip>
        </template>
        <div class="px-3 pt-2 pb-2 text-left"
             v-if="activeName">
          <div class="p-a b-t b-light">
            <template
              v-if="[CommunicationTypes.SMS, CommunicationTypes.EMAIL, CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)">
              <template v-if="[CommunicationTypes.SMS, CommunicationTypes.NOTE].includes(communication.type) && communication.attachments && communication.attachments.length > 0">
                <q-img
                  v-for="(image, index) in communication.attachments"
                  class="img-fluid d-block r-2x"
                  :key="index"
                  :class="index > 0 ? 'mb-1' : ''"
                  height="200px"
                  :src="image.url">
                  <template v-slot:loading>
                    <q-spinner-gears />
                  </template>
                  <template v-slot:error>
                    <div class="absolute-full flex flex-center bg-negative text-white">
                      Error!
                    </div>
                  </template>
                </q-img>
              </template>

              <div v-if="communication.body">
                <div class="fs-13 text-muted mb-2 line-height-15"
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
              <template v-if="communication.callback_status === CommunicationCallbackStatus.CALLBACK_STATUS_REQUESTED">
                Callback requested
              </template>
              <template v-else>
                This call
                {{ communication.disposition_status2 === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW ? 'is' : 'was' }}
                {{ communication.disposition_status2 | translateDispositionStatusText | replaceDash }}.
              </template>
            </div>

            <div class="w-100"
                 v-if="[CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)">
              <div class="form-group row mb-0 pt-2 pb-2">
                <div class="d-flex align-items-center w-100"
                     v-if="communication.type === CommunicationTypes.APPOINTMENT">
                  <div class="w-75">
                    <label class="form-control-label w-100 mb-1">Date</label>
                    {{ communication.engagement_data.appointment_datetime | fixScheduleDate('dddd, D MMMM YYYY', communication.engagement_data.appointment_contact_timezone) }}
                  </div>
                  <div class="w-35">
                    <label class="form-control-label w-100 mb-1">Time</label>
                    {{ communication.engagement_data.appointment_datetime | fixScheduleTime(0, communication.engagement_data.appointment_contact_timezone) }}
                  </div>
                </div>
                <div class="d-flex align-items-center w-100"
                     v-if="communication.type === CommunicationTypes.REMINDER">
                  <div class="w-75">
                    <label class="form-control-label w-100 mb-1">Date</label>
                    {{ communication.engagement_data.reminder_datetime | fixScheduleDate('dddd, D MMMM YYYY', communication.engagement_data.reminder_contact_timezone) }}
                  </div>
                  <div class="w-35">
                    <label class="form-control-label w-100 mb-1">Time</label>
                    {{ communication.engagement_data.reminder_datetime | fixScheduleTime(0, communication.engagement_data.reminder_contact_timezone) }}
                  </div>
                </div>
              </div>
            </div>

            <div class="w-100 pt-2 d-flex flex-column pb-2 mb-2 border-bottom"
                 v-if="(verbose || activityMode) && ![CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)">
              <div class="form-group row">
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

            <div class="mb-2 pb-2 border-bottom d-flex"
                 v-if="communication.type === CommunicationTypes.CALL && communication.direction === CommunicationDirections.INBOUND && getRingGroup(communication.ring_group_id)">
              <div class="w-100">
                <label class="form-control-label mb-1">Ring Group</label>
                <router-link
                  :to="{ name: 'Ring Group Activity', params: { ring_group_id: communication.ring_group_id }}"
                  v-if="!getRingGroup(communication.ring_group_id).call_waiting">
                  <!-- we are only showing this section if the ring group is available-->
                  <q-tooltip anchor="top left"
                             self="top left">
                    Click For More Info
                    <span class="text-dark-greenish">
                      {{ getRingGroup(communication.ring_group_id, true) }}
                    </span>
                  </q-tooltip>
                </router-link>
                <template v-else>
                  Call waiting Queue
                </template>
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
                      {{ rejectionTooltipData(communication.rejected_by_app, communication.type) }}
                    </q-tooltip>
                  </q-icon>
                  <div v-else-if="getUser(communication.user_id) && getUser(communication.user_id).id">
                    <div @click="onOpenUserInClassicClicked(communication?.user_id)">
                      <span class="text-black cursor-pointer"
                            :title="getUserName(getUser(communication.user_id))">
                        <q-tooltip class="item"
                                   content-class="bg-grey-light11"
                                   anchor="top left"
                                   self="center middle">
                          Click For More Info
                        </q-tooltip>
                        {{ getUserName(getUser(communication.user_id)) }}
                      </span>
                    </div>
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

                  <q-icon class="status-icon d-inline-block text-danger"
                          :state="communication.rejected_by_app"
                          :name="rejectionToIcon(communication.rejected_by_app)"
                          v-if="communication.rejected_by_app !== 0">
                    <q-tooltip
                      anchor="top middle"
                      self="bottom middle"
                      max-width="150px">
                      {{ rejectionTooltipData(communication.rejected_by_app, communication.type) }}
                    </q-tooltip>
                  </q-icon>

                  <!--q-tooltip class="item"
                             content-class="bg-grey-light11"
                             anchor="top middle"
                             self="top middle"
                             v-if="communication.rejected_by_app !== 0">
                    {{ rejectionTooltipData(communication.rejected_by_app, communication.type) }}
                    <component class="status-icon d-inline-block"
                               v-bind:is="icon"
                               :name="rejectionToIcon(communication.rejected_by_app)">
                    </component>
                  </q-tooltip-->
                  <div v-else-if="getUser(communication.user_id) && getUser(communication.user_id).id">
                    <div @click="onOpenUserInClassicClicked(communication?.user_id)">
                      <span class="text-black cursor-pointer"
                            :title="getUserName(getUser(communication.user_id))">
                        <q-tooltip class="item"
                                   content-class="bg-grey-light11"
                                   anchor="top left"
                                   self="center left">
                          Click For More Info
                        </q-tooltip>
                        {{ getUserName(getUser(communication.user_id)) }}
                      </span>
                    </div>
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
                                <div @click="onOpenUserInClassicClicked(communication?.user_id)">
                                  <span class="cursor-pointer"
                                        :class="getAttemptingClass(attemptingUser, communication.disposition_status2, communication.user_id)"
                                        :title="getUserName(getUser(attemptingUser))">
                                    {{ getUserName(getUser(attemptingUser)) }}
                                  </span>
                                </div>
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
              <div class="d-flex flex-column justify-content-center pb-2 w-100 overflow-auto text-break"
                   v-if="communication.type === CommunicationTypes.APPOINTMENT && communication.engagement_data.appointment_note">
                {{ communication.engagement_data.appointment_note }}
              </div>
              <div class="d-flex flex-column justify-content-center pb-2 w-100 overflow-auto text-break"
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
                         v-if="showAudio(communication)">
                    Call Recording
                  </label>
                  <div class="d-flex align-items-center w-100 mb-2 border-bottom"
                       v-if="showAudio(communication)">
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
                    <div class="d-flex align-items-center flex-column w-100">
                      <div v-for="(attachment, index) in communication.attachments"
                            :key="index"
                            class="text-dark-greenish w-100">
                        <download-button is-simple
                                         show-file-name
                                         :communication-id="communication.id"
                                         :filename="attachment.name"
                                         :file-mime-type="attachment.mime_type"
                                         :attachment-url="attachment.url"/>
                      </div>
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
               v-if="[CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)">
            <div>
              <div class="d-flex flex-row w-100 align-items-start"
                   :class="[communication.type === CommunicationTypes.REMINDER ? 'text-left' : 'justify-center']">
                <open-calendar-button :communicationId="communication.id"
                                      class="pr-2" />
                <sms-reminders ref="sms-reminder"
                               class="d-flex flex-row justify-content-center w-100"
                               :communicationId="communication.id"
                               :campaignId="campaignId"
                               :appointmentDatetime="communication.engagement_data.appointment_datetime"
                               v-if="communication.type === CommunicationTypes.APPOINTMENT && campaignId">
                </sms-reminders>
              </div>
            </div>
          </div>

          <div class="row p-l p-r"
               v-if="![CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type) && activityMode">
            <div class="col-12 text-center">
              <router-link
                :to="{ name: 'Communication', params: { contactId: contact.id , communicationId: communication.id}}">
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
    <div class="px-3 pt-2 bottom-radius border-no-top text-left bg-white notes-body overflow-auto text-break"
         v-if="communication.notes && !activeName && communication.type !== CommunicationTypes.NOTE && !isParkedCall && !isActiveCall">
      <label class="form-control-label mb-1 text-left">Note</label>
      <p class="text-left"
         v-html="$options.filters.nl2br(communication.notes)">
      </p>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import {
  aclMixin,
  avatarMixin,
  communicationInfoMixin,
  dateMixin,
  userMixin,
  notificationMixin,
  liveCallsMixin,
  mentionsMixin
} from 'src/plugins/mixins'
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
import * as CommunicationRejectionReasons from '../constants/communication-rejection-reasons'
import * as CommunicationCallbackStatus from '../constants/callback-status'
import CancelCallIcon from 'components/icons/cancel-call-icon'
import AcceptCallIcon from 'components/icons/accept-call-icon'
import ParkedCallIcon from 'components/icons/parked-call-icon'
import ParkCallIcon from 'components/icons/park-call-icon'
import HangupIcon from 'components/icons/hangup-icon'
import IgnoreCallIcon from 'components/icons/ignore-call-icon'
import OpenCalendarButton from 'components/open-calendar-button'
import DownloadButton from 'components/download-button'
import API from 'src/plugins/api/api'

export default {
  name: 'communication-info',

  mixins: [
    aclMixin,
    avatarMixin,
    communicationInfoMixin,
    dateMixin,
    userMixin,
    notificationMixin,
    liveCallsMixin,
    mentionsMixin
  ],

  components: {
    OpenCalendarButton,
    IgnoreCallIcon,
    HangupIcon,
    ParkCallIcon,
    ParkedCallIcon,
    AcceptCallIcon,
    CancelCallIcon,
    CalendarIcon,
    ChevronRight,
    CallDispositionSelector,
    CommunicationAudio,
    CommunicationNote,
    CommunicationTags,
    SmsReminders,
    TargetUsersTree,
    DownloadButton
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
      activeName: false,
      loadingUpdateEngagement: false,
      showCallMenu: false,
      isRejecting: false,
      isHangingUp: false,
      isParking: false,
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
        },
        {
          label: 'Missed',
          value: CommunicationDispositionStatus.DISPOSITION_STATUS_APPOINTMENT_MISSED
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
        },
        {
          label: 'Missed',
          value: CommunicationDispositionStatus.DISPOSITION_STATUS_MISSED_NEW
        }
      ],
      activityExpansionClass: [],
      AnswerTypes,
      CommunicationDirections,
      CommunicationCurrentStatus,
      CommunicationDispositionStatus,
      CommunicationTypes,
      UploadedFileTypes,
      CommunicationRejectionReasons,
      CommunicationCallbackStatus
    }
  },

  computed: {
    ...mapState(['campaigns', 'workflows', 'ringGroups', 'callDispositions', 'dialer', 'notifications']),
    ...mapState('cache', ['currentCompany']),
    ...mapState('inbox', ['liveContacts', 'contacts']),
    ...mapState('broadcast', ['broadcasts']),

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
        return this.parseMentionToView(this.communication.body)
      }

      return this.communication.body
    }
  },

  created () {
    this.onActivityHide()

    // make appointments and reminders opened by default
    if ([CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(this.communication.type)) {
      this.activeName = true
      this.activityExpansionClass = ['activity-expanded']
    }
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
      const activityClass = { data: 'activity-unexpanded' }
      if (this.hasNotes) {
        activityClass.data += ' collapsed-has-notes'
      }
      this.activityExpansionClass = [activityClass.data]
    },

    getCampaign (id) {
      if (!id) {
        return null
      }
      const found = this.campaigns.find(campaign => campaign.id === id)
      if (found) {
        return found
      }

      return null
    },

    getCommunicationCampaignName () {
      const communicationIncomingNumber = _.get(this.communication, 'incoming_number', null)
      if (!communicationIncomingNumber) {
        return null
      }
      const found = this.campaigns.find(campaign => campaign.id === _.get(this.communication, 'campaign_id', null))
      if (found) {
        return found.name
      }

      return null
    },

    getRingGroup (id, getName = false) {
      if (!id) {
        return getName ? '' : null
      }
      const found = this.ringGroups.find(ringGroup => ringGroup.id === id)
      if (found) {
        return getName ? found.name : found
      }

      return getName ? '' : null
    },

    getWorkflow (id) {
      if (!id) {
        return null
      }
      const found = this.workflows.find(workflow => workflow.id === id)
      if (found) {
        return found
      }

      return null
    },

    getBroadcast (id) {
      if (!id) {
        return null
      }
      const found = this.broadcasts.find(broadcast => broadcast.id === id)
      if (found) {
        return found
      }

      return null
    },

    getClassicUrlUserActivity (userId) {
      return process.env.API_URL + `/users/${userId}/activity`
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
      const params = {
        status: this.communication.disposition_status2,
        entity_type: 'communication'
      }

      this.loadingUpdateEngagement = true
      API.V1.contact.updateEngagement(this.communication.contact_id, this.communication.id, params).then(res => {
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
    },

    onOpenUserInClassicClicked (userId) {
      window.open(this.getClassicUrlUserActivity(userId), '_blank')
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
