<template>
  <div v-if="communication">
    <b-row>
      <b-col md="4"
             sm="12"
             class="pl-0 pr-0">

        <q-card flat bordered class="communication-details-card bg-grey-1">
          <q-card-section class="pb-0">
            <div class="d-flex justify-content-between header">
              <div class="fs-14 mt-1 header-title">Communication Info</div>

              <div class="d-flex header-btn-wrapper">
                <communication-report-issue
                  :communication-id="communication.id"></communication-report-issue>
                <b-button v-if="hasPermissionTo('archive communication')"
                          variant="danger"
                          size="sm"
                          @click="onArchive">
                  Archive
                </b-button>
              </div>
            </div>
            <hr class="has-margin mt-3 header-line"/>
          </q-card-section>

          <!--COMM TYPE-->
          <q-card-section class="pt-0 comm-type-container">
            <div class="text-lt p-x d-inline-flex"
                 :class="[!communication.duration ? 'flex-grow-1 text-left' : '']">
              <component :is="stateToIcon(communication.disposition_status2, communication.type, communication.direction, communication.callback_status)"
                         v-if="communication.disposition_status2">
              </component>
              <div class="comm-type-wrapper">
                <span v-if="![CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)">
                  {{ communication.direction | fixCommDirection }}
                </span>
                {{ communication.type | fixCommType }}
              </div>
            </div>
          </q-card-section>

          <!--ATTACHMENTS-->
          <q-card-section v-if="[CommunicationTypes.SMS, CommunicationTypes.EMAIL, CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)"
                          class="pt-0 pb-0">

            <div v-if="communication.attachments && communication.attachments.length > 0">
              <div v-for="(attachment, index) in communication.attachments"
                   :key="index">
                <q-img
                  class="img-fluid d-block r-2x br-8"
                  height="300px"
                  native-context-menu
                  v-if="(attachment.mime_type && isAttachmentImage(attachment.mime_type)) || !attachment.mime_type"
                  :class="index > 0 ? 'mb-1' : ''"
                  :key="index"
                  :src="attachment.url">
                  <template v-slot:error>
                    <div class="absolute-full flex flex-center bg-negative text-white">
                      Error!
                    </div>
                  </template>
                  <template v-slot:default>
                    <download-button buttonStyle="top: 8px; left: 8px"
                                     :filename="attachment.name"
                                     :attachment-url="attachment.url"/>
                  </template>
                </q-img>

                <div v-if="attachment.mime_type && isAttachmentAudio(attachment.mime_type)">
                  <audio class="audio-player"
                         controls>
                    <source :src="attachment.url"
                            :type="attachment.mime_type">
                    Your browser does not support the audio element.
                  </audio>
                </div>

                <div v-if="attachment.mime_type && isAttachmentVideo(attachment.mime_type)">
                  <video width="320"
                         class="rounded"
                         controls>
                    <source :src="attachment.url"
                            :type="attachment.mime_type">
                    Your browser does not support the video tag.
                  </video>
                </div>

                <download-button is-simple-attachment
                                 :filename="attachment.name"
                                 :attachment-url="attachment.url"
                                 v-if="attachment.mime_type && (isAttachmentText(attachment.mime_type) || isAttachmentApplication(attachment.mime_type))">
                </download-button>
              </div>
            </div>

            <div v-if="communication.body"
                 class="fs-13 my-2">
              <span class="text-muted"
                v-if="communication.type !== CommunicationTypes.SMS"
                v-html="$options.filters.nl2br(communication.body)">
              </span>
              <span class="text-muted fs-14 font-weight-light-bold"
                    v-else>
                  {{ communication.body }}
              </span>
            </div>

          </q-card-section>

          <!--COMM DESCRIPTION-->
          <q-card-section class="pb-0 comm-description-card">
            <div class="fs-13 my-2 text-grey-90"
                 v-if="communication.type === CommunicationTypes.CALL">
              <span>{{ callDescriptionText }}</span>

            {{ communication.disposition_status2 | translateDispositionStatusText | replaceDash }}.
          </div>

          </q-card-section>

          <q-card-section class="pt-0 pb-0"
                          v-if="communication?.contact">
            <!--CONTACT-->
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

            <!--DISPOSITION-->
            <b-form-row>
              <b-col class="pl-0 pr-0">
                <q-item-label>Disposition: </q-item-label>
              </b-col>
              <b-col class="text-capitalize"
                     v-if="communication.direction === CommunicationDirections.INBOUND
                            && communication.disposition_status2 === CommunicationDispositionStatus.DISPOSITION_STATUS_ABANDONED_NEW
                            && [CommunicationCallbackStatus.CALLBACK_STATUS_INITIATED, CommunicationCallbackStatus.CALLBACK_STATUS_REQUESTED].includes(communication.callback_status)">
                {{ $options.filters.translateDispositionStatusText(communication.disposition_status2, communication.callback_status) | replaceDash | capitalize }}
              </b-col>
              <b-col v-else>
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
          <q-card-section class="pt-0 pb-0">
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
            <div v-if="[CommunicationTypes.CALL].includes(communication.type)">
              <b-form-row>
                <b-col class="pl-0 pr-0">
                  <q-item-label class="mt-2">Target Users <span v-if="communication.target_users && communication.target_users.length">({{ attemptLabel }})</span>: </q-item-label>
                </b-col>
                <b-col>
                  <target-users-tree class="w-100"
                                     :communication="communication"
                                     :show-label="false"/>
                </b-col>
              </b-form-row>
              <hr/>
            </div>

            <div v-if="[CommunicationTypes.CALL, CommunicationTypes.SMS, CommunicationTypes.EMAIL, CommunicationTypes.NOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)">
              <b-form-row>
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
                    {{ rejectionTooltipData(communication.rejected_by_app, communication.type) }}
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
            </div>
            <div v-if="communication.type === CommunicationTypes.CALL && communication.attempting_users && communication.attempting_users.length > 0 && verbose">
              <b-form-row >
                <b-col class="pl-0 pr-0">
                  <q-item-label>Attempting Users: </q-item-label>
                </b-col>
                <b-col>
                  <ul class="list list-unstyled inset mb-0">
                    <li v-for="(attemptingUser, index) in communication.attempting_users"
                        :key="attemptingUser + '-user-' + index"
                        class="pb-1">
                      <router-link
                        :to="{ name: 'User Activity', params: { userId: getUser(attemptingUser).id }}">
                                        <span :class="getAttemptingClass(attemptingUser, communication.disposition_status2, communication.user_id)"
                                              :title="getUserName(getUser(attemptingUser))">
                                            {{ getUserName(getUser(attemptingUser)) }}
                                        </span>
                      </router-link>
                    </li>
                  </ul>
                </b-col>
              </b-form-row>
              <hr/>
            </div>

            <b-form-row v-if="![CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)">
              <b-col class="pl-0 pr-0">
                <q-item-label>{{ communication.type === CommunicationTypes.CALL ? 'Started at' : 'Sent at'}}: </q-item-label>
              </b-col>
              <b-col>
                <div class="d-flex align-items-center">
                  {{ communication.created_at | fixCommunicationDateTime }}
                </div>
              </b-col>
            </b-form-row>
          </q-card-section>
          <q-card-section class="pt-0 pb-0">
            <div v-if="communication.type === CommunicationTypes.SMS">
              <b-form-row>
                <b-col class="pl-0 pr-0">
                  <q-item-label>Current Status: </q-item-label>
                </b-col>
                <b-col>
                  <div class="d-flex align-items-center">
                    {{
                      communication.current_status2 !== CommunicationCurrentStatus.CURRENT_STATUS_COMPLETED_NEW
                        ? $options.filters.translateCurrentStatusText(communication.current_status2) :
                        $options.filters.translateDispositionStatusText(communication.disposition_status2) | replaceDash | capitalize
                    }}
                  </div>
                </b-col>
              </b-form-row>
              <hr/>
            </div>
            <div v-if="communication.type === CommunicationTypes.CALL && verbose">
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
            </div>

            <div v-if="[CommunicationTypes.CALL, CommunicationTypes.RVM].includes(communication.type) && verbose">
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
            </div>

            <div v-if="[CommunicationTypes.SMS].includes(communication.type)">
              <b-form-row>
                <b-col class="pl-0 pr-0">
                  <q-item-label>Parts: </q-item-label>
                </b-col>
                <b-col>
                  <div class="d-flex align-items-center">
                    {{ communication.duration }}
                  </div>
                </b-col>
              </b-form-row>
            </div>
          </q-card-section>

          <q-card-section class="pt-0 pb-0">
            <!--TALK TIME-->
            <div v-if="communication.type === CommunicationTypes.CALL">
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
            </div>

            <!--WAIT TIME-->
            <div v-if="![CommunicationTypes.SMS, CommunicationTypes.RVM, CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type) && verbose">
              <b-form-row>
                <b-col class="pl-0 pr-0">
                  <q-item-label>Wait Time: </q-item-label>
                </b-col>
                <b-col>
                  <div class="d-flex align-items-center">
                    <span v-if="communication.disposition_status2 === CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED_NEW">{{ communication.wait_time | fixDuration }}</span>
                    <span v-else>-</span>
                  </div>
                </b-col>
              </b-form-row>
              <hr/>
            </div>
          </q-card-section>

          <q-card-section v-if="![CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)"
                          class="pt-0 pb-0">

            <!--LINE-->
            <b-form-row v-if="communication.campaign_id">
              <b-col class="pl-0 pr-0">
                <q-item-label>Line: </q-item-label>
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

            <!--RING GROUP-->
            <b-form-row v-if="communication.ring_group_id">
              <b-col class="pl-0 pr-0">
                <q-item-label>Ring Group: </q-item-label>
              </b-col>
              <b-col>
                <div class="d-flex align-items-center">
                  <router-link
                    :to="{ name: 'Ring Group Activity', params: { ringGroupId: communication.ring_group_id }}"
                    v-if="usedRingGroup && !usedRingGroup?.call_waiting">
                    <q-tooltip
                      anchor="top middle"
                      self="bottom middle"
                      max-width="150px">
                      Click for more info
                    </q-tooltip>
                    {{ usedRingGroup.name }}
                  </router-link>
                  <template v-else>
                    <span v-if="usedRingGroup?.call_waiting">
                      Call waiting Queue
                    </span>
                    <span v-else>
                      Deleted Ring Group
                    </span>
                  </template>
                </div>
              </b-col>
            </b-form-row>

            <!--SEQUENCE-->
            <b-form-row v-if="communication.workflow_id">
              <b-col class="pl-0 pr-0">
                <q-item-label>Sequence: </q-item-label>
              </b-col>
              <b-col>
                <div class="d-flex align-items-center">
                  <router-link
                    :to="{ name: 'Sequence Activity', params: { sequenceId: communication.workflow_id }}"
                    v-if="useSequence">
                    <q-tooltip
                      anchor="top middle"
                      self="bottom middle"
                      max-width="150px">
                      Click for more info
                    </q-tooltip>
                    {{ useSequence.name }}
                  </router-link>
                  <template v-else>
                    Deleted Sequence
                  </template>
                </div>
              </b-col>
            </b-form-row>

            <!--BROADCAST-->
            <b-form-row v-if="communication.broadcast_id">
              <b-col class="pl-0 pr-0">
                <q-item-label>Broadcast: </q-item-label>
              </b-col>
              <b-col>
                <div class="d-flex align-items-center">
                  <router-link
                    :to="{ name: 'Broadcast Activity', params: { broadcastId: communication.broadcast_id }}"
                    v-if="useBroadCast">
                    <q-tooltip
                      anchor="top middle"
                      self="bottom middle"
                      max-width="150px">
                      Click for more info
                    </q-tooltip>
                    {{ useBroadCast.name }}
                  </router-link>
                  <template v-else>
                    Deleted Broadcast
                  </template>
                </div>
              </b-col>
            </b-form-row>

            <!--TRANSFERRED FROM-->
            <b-form-row v-if="communication.transfer_prior_user_ids">
              <b-col class="pl-0 pr-0">
                <q-item-label>Transferred from: </q-item-label>
              </b-col>
              <b-col>
                <div class="d-flex align-items-center">
                  <router-link
                    v-for="(userId, index) in communication.transfer_prior_user_ids"
                    :key="userId + '-user-' + index"
                    :to="{ name: 'User Activity', params: {userId: userId }}">

                    <q-tooltip
                      anchor="top middle"
                      self="bottom middle"
                      max-width="150px">
                      {{ getUserName(getUser(userId)) }}
                    </q-tooltip>
                    {{ getUserName(getUser(userId)) }}
                  </router-link>
                </div>
              </b-col>
            </b-form-row>

            <!--TRANSFERRED TO-->
            <b-form-row v-if="communication.transfer_target_user_ids">
              <b-col class="pl-0 pr-0">
                <q-item-label>Transferred to: </q-item-label>
              </b-col>
              <b-col>
                <div class="d-flex align-items-center">
                  <router-link
                    v-for="(userId, index) in communication.transfer_target_user_ids"
                    :key="userId + '-user-' + index"
                    :to="{ name: 'User Activity', params: {userId: userId }}">

                    <q-tooltip
                      anchor="top middle"
                      self="bottom middle"
                      max-width="150px">
                      {{ getUserName(getUser(userId)) }}
                    </q-tooltip>
                    {{ getUserName(getUser(userId)) }}
                  </router-link>
                </div>
              </b-col>
            </b-form-row>

            <!--COLD TRANSFER-->
            <b-form-row v-if="communication.transfer_target_user_ids">
              <b-col class="pl-0 pr-0">
                <q-item-label>Cold transferred: </q-item-label>
              </b-col>
              <b-col>
                <div class="d-flex align-items-center">
                  {{ communication.in_cold_transfer | fixBooleanType }}
                </div>
              </b-col>
            </b-form-row>

            <!--CHILD CALL - NEW-->
            <b-form-row v-if="communication.metadata && communication.metadata.new_communication_id">
              <b-col class="pl-0 pr-0">
                <q-item-label>Child Call: </q-item-label>
              </b-col>
              <b-col>
                <div class="d-flex align-items-center">
                  <router-link :to="{ name: 'Communication', params: {contactId: communication.contact_id, communicationId: communication.metadata.new_communication_id }}">
                    More info
                  </router-link>
                </div>
              </b-col>
            </b-form-row>

            <!--PARENT CALL - ORIGINAL-->
            <b-form-row v-if="communication.metadata && communication.metadata.original_communication_id">
              <b-col class="pl-0 pr-0">
                <q-item-label>Parent Call: </q-item-label>
              </b-col>
              <b-col>
                <div class="d-flex align-items-center">
                  <router-link :to="{ name: 'Communication', params: {contactId: communication.contact_id, communicationId: communication.metadata.original_communication_id }}">
                    More info
                  </router-link>
                </div>
              </b-col>
            </b-form-row>

            <!--CHILD CALL - ACTIVE-->
            <b-form-row v-if="communication.metadata && communication.metadata.active_communication_id">
              <b-col class="pl-0 pr-0">
                <q-item-label>Child Call: </q-item-label>
              </b-col>
              <b-col>
                <div class="d-flex align-items-center">
                  <router-link :to="{ name: 'Communication', params: {contactId: communication.contact_id, communicationId: communication.metadata.active_communication_id }}">
                    More info
                  </router-link>
                </div>
              </b-col>
            </b-form-row>

            <!--PARENT CALL - FAKE-->
            <b-form-row v-if="communication.metadata && communication.metadata.fake_communication_id">
              <b-col class="pl-0 pr-0">
                <q-item-label>Parent Call: </q-item-label>
              </b-col>
              <b-col>
                <div class="d-flex align-items-center">
                  <router-link :to="{ name: 'Communication', params: {contactId: communication.contact_id, communicationId: communication.metadata.fake_communication_id }}">
                    More info
                  </router-link>
                </div>
              </b-col>
            </b-form-row>

            <!--SENT BY-->
            <b-form-row v-if="getUser(communication.user_id) && communication.type === CommunicationTypes.SMS">
              <b-col class="pl-0 pr-0">
                <q-item-label>Sent by: </q-item-label>
              </b-col>
              <b-col>
                <div class="d-flex align-items-center">
                  {{ getUser(communication.user_id).name }}
                </div>
              </b-col>
            </b-form-row>

            <!--RECORDING-->
            <b-form-row v-if="communication.type === CommunicationTypes.CALL">
              <b-col class="pl-0 pr-0">
                <q-item-label class="mt-3 custom-item-label">Recording: </q-item-label>
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

            <!--VM-->
            <b-form-row v-if="[CommunicationTypes.CALL, CommunicationTypes.RVM].includes(communication.type)">
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

          <!--FILES HERE-->
          <q-card-section v-if="[CommunicationTypes.FAX, CommunicationTypes.EMAIL].includes(communication.type) && communication.attachments && communication.attachments.length > 0"
                          class="pt-0 pb-0">
            <b-form-row>
              <b-col class="pl-0 pr-0">
                <q-item-label>Files: </q-item-label>
              </b-col>

              <b-col>
                <div v-for="(attachment, index) in communication.attachments"
                     :key="index"
                     class="text-dark-greenish w-100">
                  <download-button is-simple
                                   show-file-name
                                   :filename="attachment.name"
                                   :attachment-url="attachment.url"/>
                </div>
              </b-col>
            </b-form-row>
          </q-card-section>

          <!--NOTES-->
          <q-card-section class="pt-0 pb-0">
            <b-form-row>
              <b-col class="pl-0 pr-0">
                <q-item-label>Notes: </q-item-label>
              </b-col>
              <b-col>
                <div v-if="!isEditingNote"
                     class="align-items-center">
                  <div class="notes mt-1" v-html="communication.notes"></div>
                  <b-link href="#"
                          class="custom-link text-decoration-none btn-tag-edit d-flex align-items-center"
                          @click="onEditNote">
                    <slot name="button">
                      <span>
                        {{ (!communication.notes || !communication.notes.trim().length) ? 'Add' : 'Edit' }} Note
                      </span>
                    </slot>
                  </b-link>
                </div>
                <div v-if="isEditingNote"
                     class="d-flex align-items-center">
                  <communication-note ref="communicationNotes"
                                      :communication="communication"
                                      @notesBlurred="isEditingNote = false">
                  </communication-note>
                </div>
              </b-col>
            </b-form-row>
          </q-card-section>

          <!-- CREATOR TYPE -->
          <q-card-section class="pt-0 pb-0">
            <b-form-row>
              <b-col class="pl-0 pr-0">
                <q-item-label>Creator Type: </q-item-label>
              </b-col>
              <b-col>
                <span>
                  {{ communication.creator_type | translateCreatorType }}
                </span>
              </b-col>
            </b-form-row>
          </q-card-section>

          <q-card-section class="pt-0 pb-0">
            <!--TAGS-->
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

          <!--CALL DISPOSITION-->
          <q-card-section v-if="communication.type === CommunicationTypes.CALL && currentCompany && callDispositions &&  callDispositions.length > 0 && !dialerMode"
                          class="pt-0 pb-0">
            <b-form-row>
              <b-col class="pl-0 pr-0">
                <q-item-label class="mt-3 custom-item-label">Call Disposition: </q-item-label>
              </b-col>
              <b-col>
                <div class="d-flex align-items-center">
                  <call-disposition-selector
                    :communication="communication"></call-disposition-selector>
                </div>
              </b-col>
            </b-form-row>
          </q-card-section>
        </q-card>
      </b-col>
      <b-col md="8"
             class="pr-0 ring-group-snapshot-wrapper"
             v-if="communication && communication.type === CommunicationTypes.CALL">
          <ring-group-snapshot :communication="communication"
                               :ring-group="usedRingGroup">
          </ring-group-snapshot>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import _ from 'lodash'
import { mapState } from 'vuex'
import {
  aclMixin,
  userMixin,
  communicationInfoMixin
} from 'src/plugins/mixins'

import * as CommunicationTypes from '../constants/communication-types'
import * as CommunicationDispositionStatus from '../constants/communication-disposition-status'
import * as CommunicationDirections from '../constants/communication-direction'
import * as UploadedFileTypes from '../constants/uploaded-file-types'
import * as CommunicationCurrentStatus from '../constants/communication-current-status'

import talk2Api from 'src/plugins/api/api'
import TargetUsersTree from 'components/target-users-tree'
import CommunicationAudio from 'components/communication-audio'
import CommunicationNote from 'components/communication-note'
import CommunicationTags from 'components/generic-selectors/communication-tags'
import CallDispositionSelector from 'components/call-disposition-selector'

import CommunicationReportIssue from 'components/communication-report-issue'
import RingGroupSnapshot from 'components/ring-group-snapshot'
import PredefinedTimeDurationSelector from 'components/predefined-time-duration-selector'
import PencilOIcon from 'components/icons/pencil-o-icon'
import DownloadButton from 'components/download-button'
import * as CommunicationCallbackStatus from '../constants/callback-status'

export default {
  name: 'communication-details',

  components: {
    PencilOIcon,
    PredefinedTimeDurationSelector,
    RingGroupSnapshot,
    CommunicationReportIssue,
    CallDispositionSelector,
    CommunicationTags,
    CommunicationNote,
    CommunicationAudio,
    TargetUsersTree,
    DownloadButton
  },

  mixins: [
    communicationInfoMixin,
    userMixin,
    aclMixin
  ],

  data () {
    return {
      activeName: false,
      isEditingNote: false,
      CommunicationTypes,
      CommunicationCurrentStatus,
      CommunicationDispositionStatus,
      CommunicationDirections,
      UploadedFileTypes,
      CommunicationCallbackStatus
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
    ...mapState(['campaigns', 'workflows', 'broadcasts', 'ringGroups', 'callDispositions']),
    ...mapState('cache', ['currentCompany']),
    usedCampaign () {
      if (!this.communication.campaign_id) {
        return null
      }

      const communicationIncomingNumber = _.get(this.communication, 'incoming_number', null)
      if (!communicationIncomingNumber) {
        return null
      }

      const campaign = this.campaigns.find(campaign => campaign.id === this.communication.campaign_id)
      if (campaign) {
        return campaign
      }

      return null
    },

    usedRingGroup () {
      if (this.communication.ring_group_id) {
        return this.getRingGroup(this.communication.ring_group_id)
      }

      if (this.communication.metadata && this.communication.metadata.added_ring_group_id) {
        return this.getRingGroup(this.communication.metadata.added_ring_group_id)
      }

      return null
    },

    useSequence () {
      if (!this.communication.workflow_id) {
        return null
      }
      const sequence = this.workflows.find(workflow => workflow.id === this.communication.workflow_id)

      return sequence || null
    },

    useBroadCast () {
      if (!this.communication.broadcast_id) {
        return null
      }
      const broadcast = this.broadcasts.find(workflow => workflow.id === this.communication.broadcast_id)

      return broadcast || null
    },

    attemptLabel () {
      return this.communication.attempt ? `attempt ${this.communication.attempt}` : 'no attempts'
    },

    callDescriptionText () {
      const text = 'This call '

      switch (this.communication.disposition_status2) {
        case CommunicationDispositionStatus.DISPOSITION_STATUS_VOICEMAIL_NEW:
          return text + 'left a'
        case CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW:
          return text
        case CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW:
          return text + 'is'
        default:
          return text + 'was'
      }
    }
  },

  methods: {
    getCommunicationCampaignName () {
      const communicationIncomingNumber = _.get(this.communication, 'incoming_number', null)
      if (!communicationIncomingNumber) {
        return null
      }

      return this.getCampaign(this.campaignId)?.name
    },

    getCampaign (id) {
      if (!id) {
        return null
      }

      // reference the campaign object in communication if it has
      if (this?.communication?.campaign) {
        return this.communication.campaign
      }

      const campaign = this.campaigns.find(campaign => campaign.id === id)
      if (campaign) {
        return campaign
      }

      return null
    },

    getRingGroup (id) {
      if (!id) {
        return null
      }

      const ringGroup = this.ringGroups.find(ringGroup => ringGroup.id === id)
      if (ringGroup) {
        return ringGroup
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
    },

    onEditNote () {
      this.isEditingNote = true
    },

    isAttachmentImage (mimeType) {
      return mimeType.includes('image/')
    },

    isAttachmentVideo (mimeType) {
      return mimeType.includes('video/')
    },

    isAttachmentAudio (mimeType) {
      return mimeType.includes('audio/')
    },

    isAttachmentText (mimeType) {
      return mimeType.includes('text/')
    },

    isAttachmentApplication (mimeType) {
      return mimeType.includes('application/')
    }
  }
}
</script>
