<template>
  <div class="communication-info"
       v-if="communication">
    <q-list class="rounded-contact-activity">
      <q-expansion-item
        class="contact-activity"
        v-model="activeName"
        :default-opened="false">
        <template slot="header">
          <q-item-section class="communication-header flex-row">
            <div class="ml-3 pr-2">
              <component :is="stateToIcon(communication.disposition_status2, communication.type, communication.direction)"
                         v-if="communication.disposition_status2">
              </component>
            </div>
            <div class="text-lt p-x">
              <span v-if="![CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)">
                {{ communication.direction | fixCommDirection }}
              </span>
              {{ communication.type | fixCommType }}
            </div>
            <q-item-section class="text-lt pl-2">
              <span v-if="communication.type === CommunicationTypes.CALL && activityMode">
                {{ communication.duration | fixDuration }}
              </span>
            </q-item-section>
          </q-item-section>
          <q-tooltip anchor="top middle" self="center middle">
            {{ communication.disposition_status2 | translateDispositionStatusText | replaceDash | capitalize }}
          </q-tooltip>
        </template>
        <div class="px-3 pt-2">
          <div class="p-a b-t b-light">
            <template
              v-if="[CommunicationTypes.SMS, CommunicationTypes.EMAIL, CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)">
              <template v-for="(image, index) in communication.attachments">
                <q-img
                  class="img-fluid d-block r-2x"
                  v-if="[CommunicationTypes.SMS, CommunicationTypes.NOTE].includes(communication.type) && communication.attachments && communication.attachments.length > 0"
                  :class="index > 0 ? 'mb-1' : ''"
                  :key="index"
                  :src="image.url">
                  <template v-slot:error>
                    <div class="absolute-full flex flex-center bg-negative text-white">
                      Error!
                    </div>
                  </template>
                </q-img>
              </template>

              <div v-if="communication.body">
                <span class="text-muted"
                      v-if="communication.type !== CommunicationTypes.SMS"
                      v-html="$options.filters.nl2br(communication.body)"
                      v-linkify:options="{ target: '_blank' }">
                </span>
                <span class="text-muted"
                      v-else
                      v-linkify:options="{ target: '_blank' }">
                  {{ communication.body }}
                </span>
              </div>
            </template>

            <div class="font-weight-light-bold my-2"
                  v-if="communication.type === CommunicationTypes.CALL">
              This call
              {{ communication.disposition_status2 === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW ? 'is' : 'was' }}
              {{ communication.disposition_status2 | translateDispositionStatusText | replaceDash }}.
            </div>

            <div class="w-100 pt-2 d-flex flex-row pb-2 mb-2 border-bottom">
              <div class="w-50"
                   v-if="(verbose || activityMode) && ![CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)">
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
                      {{ communication.incoming_number | fixPhone }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="w-50"
                   v-if="(verbose || activityMode) && ![CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)">
                <div class="w-100">
                  <div class="form-group row mb-0">
                    <label class="form-control-label w-100">To</label>
                    <div class="d-flex align-items-center"
                         v-if="communication.direction === CommunicationDirections.INBOUND && communication.type !== CommunicationTypes.EMAIL">
                      {{ getCommunicationCampaignName() }}
                      <br>
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

            <div class="mb-2 pb-2 border-bottom d-flex flex-row"
                 v-if="communication.type === CommunicationTypes.CALL">
              <div class="w-50">
                <label class="form-control-label">Ring Group</label>
                <div v-if="communication.ring_group_id">
                  {{ getRingGroup(communication.ring_group_id, true) }}
                </div>
                <div else>
                  -
                </div>
                <target-users-tree class="w-100"
                                   :communication="communication"
                                   :is-form="true"/>
              </div>
              <div class="w-50">
                <label class="form-control-label w-100">Answered By</label>
                <div class="d-flex align-items-center w-100">
                  <div class="status-icon d-inline-block"
                       :state="communication.rejected_by_app"
                       v-if="communication.rejected_by_app !== 0"
                       v-html="rejectionToIcon(communication.rejected_by_app)">
                    <q-tooltip anchor="bottom middle" self="top middle">
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
                                   self="center middle">
                          Click For More Info
                        </q-tooltip>
                        {{ getUserName(getUser(communication.user_id)) }}
                      </span>
                    </router-link>
                  </div>
                  <div v-else>
                    <span class="text-greyish">
                      Not Answered
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-horizontal"
                 :class="[communication.type !== CommunicationTypes.NOTE ? 'b-b': '']"
                 v-if="[CommunicationTypes.SMS, CommunicationTypes.EMAIL, CommunicationTypes.NOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)">
              <div class="form-group row mb-0 pt-2 pb-2"
                   v-if="communication.type !== CommunicationTypes.NOTE">
                <label class="form-control-label col-12">User:</label>
                <div class="d-flex align-items-center col-12">
                  <div class="status-icon d-inline-block"
                       :state="communication.rejected_by_app"
                       v-if="communication.rejected_by_app !== 0"
                       v-html="rejectionToIcon(communication.rejected_by_app)">
                    <q-tooltip anchor="bottom middle" self="top middle">
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
                      <q-tooltip class="item"
                                 content-class="bg-grey-light11"
                                 anchor="top left"
                                 self="top left"
                                 v-if="communication.rejected_by_app !== 0">
                        Click For More Info
                        <div>
                          <span class="text-dark-greenish"
                                :title="getUserName(getUser(communication.user_id))">
                            {{ getUserName(getUser(communication.user_id)) }}
                          </span>
                        </div>
                      </q-tooltip>
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
                <label class="form-control-label col-12">Attempting Users:</label>
                <div class="d-flex align-items-center col-12">
                  <span class="text-greyish">
                      <ul class="list list-unstyled inset mb-0">
                        <template v-for="(attemptingUser, index) in communication.attempting_users">
                            <li :key="attemptingUser + '-user-' + index"
                                v-if="getUser(attemptingUser) && getUser(attemptingUser).id"
                                class="pb-1">
                                <router-link
                                  :to="{ name: 'User Activity', params: {user_id: getUser(attemptingUser).id }}">
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
                 v-if="![CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)">
              <div class="d-flex flex-row w-100"
                   v-if="communication.type === CommunicationTypes.CALL">
                <div class="w-50">
                  <label class="form-control-label">
                    Started at:
                  </label>
                  <div class="d-flex align-items-center">
                    {{ communication.created_at | fixCommunicationDateTime }}
                  </div>
                </div>
                <div class="w-50">
                  <label class="form-control-label">Duration:</label>
                  <div class="d-flex align-items-center">
                    {{ communication.duration | fixDuration }}
                  </div>
                </div>
              </div>
              <div class="form-group row mb-0"
                   v-if="communication.type === CommunicationTypes.SMS">
                <label class="form-control-label col-12">
                  Sent at:
                </label>
                <div class="d-flex align-items-center col-12">
                  {{ communication.created_at | fixCommunicationDateTime }}
                </div>
              </div>
            </div>

            <div class="form-horizontal b-b"
                 v-if="communication.type === CommunicationTypes.SMS">
              <div class="form-group row mb-0">
                <label class="form-control-label col-12">
                  Current Status:
                </label>
                <div class="d-flex align-items-center col-12">
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
                <label class="form-control-label col-12">Ended at:</label>
                <div class="d-flex align-items-center col-12">
                  {{ communication.created_at | fixCommunicationDateTime(communication.duration) }}
                </div>
              </div>
            </div>

            <div class="form-horizontal"
                 v-if="(communication.type === CommunicationTypes.SMS) && verbose">
              <div class="form-group row mb-0">
                <label class="form-control-label col-12">Parts:</label>
                <div class="d-flex align-items-center col-12">
                  {{ communication.duration }}
                </div>
              </div>
            </div>

            <div class="form-horizontal b-b"
                 v-if="![CommunicationTypes.SMS, CommunicationTypes.RVM, CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type) && verbose">
              <div class="form-group row mb-0">
                <label class="form-control-label col-12">Wait time:</label>
                <div class="d-flex align-items-center">
                  <span v-if="communication.disposition_status2 == CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED_NEW">{{ communication.wait_time | fixDuration }}</span>
                  <span v-else>-</span>
                </div>
              </div>
            </div>

            <div class="form-horizontal"
                 v-if="![CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)">
              <div class="form-group row mb-0">
                <template v-if="communication.ring_group_id">
                  <label class="form-control-label col-12">
                    Ring Group:
                  </label>
                  <div class="d-flex align-items-center col-12">
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
                    <template v-else>
                      Deleted Ring Group
                    </template>
                  </div>
                </template>

                <template v-if="communication.workflow_id">
                  <label class="form-control-label col-12">
                    Sequence:
                  </label>
                  <div class="d-flex align-items-center col-12">
                    <router-link
                      :to="{ name: 'Sequence Activity', params: { workflowId: communication.workflow_id }}"
                      v-if="getWorkflow(communication.workflow_id)">
                      <q-tooltip anchor="top left"
                                 self="top left">
                        Click For More Info
                        <span class="text-dark-greenish">
                          {{ getWorkflow(communication.workflow_id).name }}
                        </span>
                      </q-tooltip>
                    </router-link>
                    <template v-else>
                      Deleted Sequence
                    </template>
                  </div>
                </template>

                <template v-if="communication.broadcast_id">
                  <label class="form-control-label col-12">
                    Broadcast:
                  </label>
                  <div class="d-flex align-items-center col-12">
                    <router-link
                      :to="{ name: 'Broadcast Activity', params: { broadcastId: communication.broadcast_id }}"
                      v-if="getBroadcast(communication.broadcast_id)">
                      <q-tooltip anchor="top left"
                                 self="top left">
                        Click For More Info
                        <span class="text-dark-greenish">
                          {{ getBroadcast(communication.broadcast_id).name }}
                        </span>
                      </q-tooltip>
                    </router-link>
                    <template v-else>
                      Deleted Broadcast
                    </template>
                  </div>
                </template>

                <div class="d-flex flex-row w-100 pb-2 mb-2 border-bottom"
                     v-if="communication.transfer_prior_user_ids || communication.transfer_target_user_ids">
                  <div class="w-50">
                    <label class="form-control-label w-100"
                           v-if="communication.transfer_prior_user_ids">
                      Transferred from:
                    </label>
                    <div class="d-flex align-items-center w-100"
                         v-if="communication.transfer_prior_user_ids">
                      <template v-for="(userId, index) in communication.transfer_prior_user_ids">
                        <router-link
                          v-if="getUser(userId)"
                          :key="userId + '-user-' + index"
                          :to="{ name: 'User Activity', params: {userId: userId }}">
                          <q-tooltip anchor="top left"
                                     self="top left">
                            Click For More Info
                            <span class="text-dark-greenish"
                                  :title="getUserName(getUser(userId))">
                              {{ getUserName(getUser(userId)) }}
                            </span>
                          </q-tooltip>
                        </router-link>
                      </template>
                    </div>
                  </div>
                  <div class="w-50">
                    <label class="form-control-label W-100"
                           v-if="communication.transfer_target_user_ids">
                      Transferred to:
                    </label>
                    <div class="d-flex align-items-center w-100"
                         v-if="communication.transfer_target_user_ids">
                      <template v-for="(userId, index) in communication.transfer_target_user_ids">
                        <router-link
                          v-if="getUser(userId)"
                          :key="userId + '-user-' + index"
                          :to="{ name: 'User Activity', params: {userId: userId }}">
                          <q-tooltip anchor="top left"
                                     self="top left">
                            Click For More Info
                            <span class="text-dark-greenish"
                                  :title="getUserName(getUser(userId))">
                              {{ getUserName(getUser(userId)) }}
                            </span>
                          </q-tooltip>
                        </router-link>
                      </template>
                    </div>
                  </div>
                </div>

                <label class="form-control-label col-12"
                       v-if="communication.transfer_target_user_ids">
                  Cold transferred?
                </label>
                <div class="d-flex align-items-center w-100 pb-2 mb-2 border-bottom"
                     v-if="communication.transfer_target_user_ids">
                  <span class="text-dark">
                    {{ communication.in_cold_transfer | fixBooleanType }}
                  </span>
                </div>

                <template v-if="communication.metadata && communication.metadata.new_communication_id">
                  <label class="form-control-label col-12">
                    Child Call:
                  </label>
                  <div class="d-flex align-items-center col-12">
                    <span class="text-dark-greenish">
                      <router-link :to="{ name: 'Communication', params: {communicationId: communication.metadata.new_communication_id }}">
                        More info
                      </router-link>
                    </span>
                  </div>
                </template>

                <template v-if="communication.metadata && communication.metadata.original_communication_id">
                  <label class="form-control-label col-12">
                    Parent Call:
                  </label>
                  <div class="d-flex align-items-center col-12">
                    <span class="text-dark-greenish">
                      <router-link :to="{ name: 'Communication', params: {communicationId: communication.metadata.original_communication_id }}">
                        More info
                      </router-link>
                    </span>
                  </div>
                </template>

                <template v-if="communication.metadata && communication.metadata.active_communication_id">
                  <label class="form-control-label col-12">
                    Child Call:
                  </label>
                  <div class="d-flex align-items-center col-12">
                    <span class="text-dark-greenish">
                      <router-link :to="{ name: 'Communication', params: {communicationId: communication.metadata.active_communication_id }}">
                        More info
                      </router-link>
                    </span>
                  </div>
                </template>

                <template v-if="communication.metadata && communication.metadata.fake_communication_id">
                  <label class="form-control-label col-12">
                    Parent Call:
                  </label>
                  <div class="d-flex align-items-center col-12">
                    <span class="text-dark-greenish">
                      <router-link :to="{ name: 'Communication', params: {communicationId: communication.metadata.fake_communication_id }}">
                        More info
                      </router-link>
                    </span>
                  </div>
                </template>

                <label class="form-control-label col-12"
                       v-if="communication.owner && communication.type === CommunicationTypes.SMS">
                  Sent by:
                </label>
                <div class="d-flex align-items-center col-12"
                     v-if="communication.owner && communication.type === CommunicationTypes.SMS">
                  <span class="text-dark">
                    {{ communication.owner.name }}
                  </span>
                </div>

                <label class="form-control-label w-100"
                       v-if="communication.type === CommunicationTypes.CALL">
                  Call Recording
                </label>
                <div class="d-flex align-items-center w-100 mb-2 border-bottom"
                     v-if="communication.type === CommunicationTypes.CALL">
                    <communication-audio :communication="communication"
                                         :type="UploadedFileTypes.TYPE_CALL_RECORDING"
                                         :uniqueId="communication.id + '1'">
                    </communication-audio>
                </div>

                <template v-if="[CommunicationTypes.FAX, CommunicationTypes.EMAIL].includes(communication.type) && communication.attachments && communication.attachments.length > 0">
                  <label class="form-control-label col-12">
                    Files:
                  </label>
                  <div class="d-flex align-items-center col-12">
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
                </template>

                <label class="form-control-label w-100"
                       v-if="[CommunicationTypes.CALL, CommunicationTypes.RVM].includes(communication.type)">
                  Voicemail
                </label>
                <div class="d-flex align-items-center w-100 mb-2 border-bottom"
                     v-if="[CommunicationTypes.CALL, CommunicationTypes.RVM].includes(communication.type)">
                  <span class="text-dark-greenish">
                    <communication-audio :communication="communication"
                                         :type="UploadedFileTypes.TYPE_CALL_VOICEMAIL"
                                         :uniqueId="communication.id + '2'">
                    </communication-audio>
                  </span>
                </div>

                <label class="form-control-label col-12">Tags</label>
                <div class="d-flex align-items-center w-100 pb-2 mb-2 border-bottom">
                  <communication-tags :communication="communication" />
                </div>

                <label class="form-control-label">Notes</label>
                <div class="d-flex flex-column justify-content-center pb-2 w-100">
                  <communication-note ref="communication_notes"
                                      :communication="communication">
                  </communication-note>
                </div>

                <template
                  v-if="communication.type === CommunicationTypes.CALL && currentCompany && callDispositions.length > 0 && !dialerMode">
                  <div class="d-flex align-items-center co-12">
                    <label class="form-control-label">Call Disposition:</label>
                    <label class="ml-1 d-flex align-items-center"
                         v-if="!currentCompany.force_call_disposition">
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
                  <div class="d-flex align-items-center pt-2 col-12">
                    <call-disposition-selector :communication="communication"></call-disposition-selector>
                  </div>
                </template>
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
                  <chevron-right width="5" height="8" />
                </button>
              </router-link>
            </div>
          </div>
          <div class="row p-l p-r"
               v-if="[CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)">
            <div class="col-12 text-center">
              <div class="text-center pb-3 b-b">
                <q-btn-toggle
                  no-caps
                  rounded
                  unelevated
                  toggle-color="primary"
                  color="white"
                  text-color="primary"
                  :options="appointmentOptions"
                  :disabled="loadingUpdateEngagement"
                  v-model="communication.disposition_status2"
                  v-if="communication.type === CommunicationTypes.APPOINTMENT"
                />
                <q-btn-toggle
                  no-caps
                  rounded
                  unelevated
                  toggle-color="primary"
                  color="white"
                  text-color="primary"
                  :options="appointmentOptions"
                  :disabled="loadingUpdateEngagement"
                  v-model="communication.disposition_status2"
                  v-else/>
              </div>
              <div class="text-center pt-3">
                <router-link
                  :to="{ name: 'Calendar', query: { communicationId: communication.id, view: 'month' }}">
                  <q-btn size="">
                    <q-icon name="fa fa-calendar"
                            class="mr-1">
                    </q-icon>
                    Open in Calendar
                  </q-btn>
                </router-link>
              </div>
              <sms-reminders :communicationId="communication.id"
                             :campaignId="campaignId"
                             :appointmentDatetime="communication.engagement_data.appointment_datetime">
              </sms-reminders>
            </div>
          </div>
        </div>
      </q-expansion-item>
    </q-list>
    <div class="p-x-sm p-y-sm b-t width-300"
         v-if="communication.notes && !activeName">
      <strong>Notes:</strong>
      <p v-html="$options.filters.nl2br(communication.notes)"></p>
    </div>
    <div class="p-x-sm p-y-sm b-t width-300"
         v-if="communication.body && communication.type === CommunicationTypes.NOTE && communication.direction === CommunicationDirections.INBOUND && !activeName">
      <strong>Notes:</strong>
      <p v-html="$options.filters.nl2br(communication.body)"></p>
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
  userMixin
} from 'src/plugins/mixins'
import { mapState } from 'vuex'
import * as AnswerTypes from '../../../constants/answer-types'
import * as CommunicationCurrentStatus from '../../../constants/communication-current-status'
import * as CommunicationDispositionStatus from '../../../constants/communication-disposition-status'
import * as CommunicationTypes from '../../../constants/communication-types'
import * as CommunicationDirections from '../../../constants/communication-direction'
import * as UploadedFileTypes from '../../../constants/uploaded-file-types'
import ContactDispositionSelector from './contact-disposition-selector'
import SmsReminders from './sms-reminders'
import TargetUsersTree from './target-users-tree'
import ChevronRight from 'components/icons/contact-activity/chevron-right'
import CommunicationAudio from 'src/pages/contacts/_components/communication-audio'
import CommunicationNote from 'src/pages/contacts/_components/communication-note'
import CommunicationTags from 'src/pages/contacts/_components/communication-tags'
import CallDispositionSelector from 'src/pages/contacts/_components/call-disposition-selector'

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
    ChevronRight,
    CallDispositionSelector,
    CommunicationAudio,
    CommunicationNote,
    CommunicationTags,
    ContactDispositionSelector,
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
      activeName: '',
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
          value: CommunicationDispositionStatus.DISPOSITION_STATUS_APPOINTMENT_SHOWN
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
      AnswerTypes,
      CommunicationDirections,
      CommunicationCurrentStatus,
      CommunicationDispositionStatus,
      CommunicationTypes,
      UploadedFileTypes
    }
  },

  created () {
    if (!this.activityMode) {
      this.activeName = 'main'
    }
    // Default to Expand/Open this component collapse component if comm type is appointment, reminder or note
    if (this.communication && [CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER, CommunicationTypes.NOTE].includes(this.communication.type)) {
      this.activeName = 'main'
    }
  },

  computed: {
    ...mapState(['campaigns', 'workflows', 'broadcasts', 'dispositionStatuses', 'callDispositions', 'ringGroups', 'currentCompany'])
  },

  methods: {
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
      const communicationIncomingNumber = _.get(this.communication, 'incoming_number', null)
      if (!communicationIncomingNumber) {
        return null
      }
      let found = this.campaigns.find(campaign => campaign.id === this.campaignId)
      if (found) {
        return found.name
      }
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
        this.$q.notify({
          offset: 95,
          title: 'Contact',
          message: 'Contact disposed',
          type: 'success',
          showClose: true
        })
        this.communication.contact.disposition_status_id = res.data.disposition_status_id
      }).catch((err) => {
        this.loadingDispose = false
        this.$handleErrors(err.response)
      })
    },

    changeEngagementStatus (status) {
      const params = {
        status: status
      }

      this.loadingUpdateEngagement = true
      this.$axios.post(`/api/v1/contact/${this.communication.contact_id}/${this.communication.id}/update-engagement`, params).then(res => {
        this.loadingUpdateEngagement = false
        this.$q.notify({
          offset: 95,
          title: 'Contact',
          message: 'Engagement updated.',
          type: 'success',
          showClose: true
        })
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
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/variables.scss';
.communication-info {
  .more-details {
    color: $blue;
  }
}
</style>
