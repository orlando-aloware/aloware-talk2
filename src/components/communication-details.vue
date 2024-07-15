<template>
  <div v-if="communication" data-testid="comm-details-wrapper">
    <b-row data-testid="comm-details-row">
      <b-col :md="isWidget ? 12 : 4"
             sm="12"
             data-testid="comm-details-col"
             class="pl-0 pr-0">

        <q-card flat
                bordered
                class="communication-details-card bg-grey-1"
                data-testid="comm-details-card">
          <q-card-section class="pb-0" data-testid="comm-details-archive-card-section">
            <div class="d-flex justify-content-between header">
              <div class="fs-14 mt-1 header-title">Communication Info</div>

              <div class="d-flex header-btn-wrapper">
                <transcription-modal class="mr-2"
                                     :communication="communication"
                                     data-testid="comm-details-transcription-modal"
                                     v-if="!communication?.transcription_is_deleted && communication?.metadata?.transcription_info?.summary"/>
                <b-button variant="danger"
                          size="sm"
                          v-if="hasPermissionTo('archive communication')"
                          data-testid="comm-details-archive-button"
                          @click="onArchive">
                  Archive
                </b-button>
              </div>
            </div>
            <hr class="has-margin mt-3 header-line"/>
          </q-card-section>

          <!--COMM TYPE-->
          <q-card-section class="pt-0 comm-type-container" data-testid="comm-details-comm-type-card-section">
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
          <q-card-section class="pt-0 pb-0"
                          v-if="typeAcceptAttachment"
                          data-testid="comm-details-attachment-section">

            <div v-if="communication.attachments && communication.attachments.length > 0">
              <div :key="index"
                   v-for="(attachment, index) in communication.attachments">
                <q-img class="img-fluid d-block r-2x br-8"
                       height="300px"
                       native-context-menu
                       :class="index > 0 ? 'mb-1 mt-1' : ''"
                       :src="attachment.url"
                       data-testid="comm-details-attachment-img"
                       v-if="(attachment.mime_type && isAttachmentImage(attachment.mime_type)) || !attachment.mime_type">
                  <template v-slot:error>
                    <div class="absolute-full flex flex-center bg-negative text-white" data-testid="comm-details-attachment-error">
                      Error!
                    </div>
                  </template>
                  <template v-slot:default>
                    <download-button buttonStyle="top: 8px; left: 8px"
                                     data-testid="comm-details-attachment-download-btn"
                                     :communication-id="communication.id"
                                     :filename="attachment.name"
                                     :file-mime-type="attachment.mime_type"
                                     :attachment-url="attachment.url"/>
                  </template>
                </q-img>

                <template v-if="attachment.mime_type">
                  <div v-if="isAttachmentAudio(attachment.mime_type)">
                    <audio class="audio-player"
                           controls
                           data-testid="comm-details-audio">
                      <source :src="attachment.url"
                              :type="attachment.mime_type"
                              data-testid="comm-details-source">
                      Your browser does not support the audio element.
                    </audio>
                  </div>

                  <div v-if="isAttachmentVideo(attachment.mime_type)">
                    <video width="320"
                           class="rounded"
                           controls
                           data-testid="comm-details-video">
                      <source :src="attachment.url"
                              :type="attachment.mime_type"
                              data-testid="comm-details-video-source">
                      Your browser does not support the video tag.
                    </video>
                  </div>

                  <download-button is-simple-attachment
                                   :communication-id="communication.id"
                                   :filename="attachment.name"
                                   :file-mime-type="attachment.mime_type"
                                   :attachment-url="attachment.url"
                                   data-testid="comm-details-download-btn"
                                   v-if="isAttachmentText(attachment.mime_type) || isAttachmentApplication(attachment.mime_type)">
                  </download-button>
                </template>
              </div>
            </div>

            <div class="fs-13 my-2"
                 v-if="communication.body">
              <span class="text-muted"
                    v-if="communication.type !== CommunicationTypes.SMS"
                    v-html="$options.filters.nl2br(communication.body)">
              </span>
              <span class="text-muted fs-14 font-weight-light-bold handle-whitespace break-word"
                    v-else>
                  {{ communication.body }}
              </span>
            </div>

          </q-card-section>

          <!--COMM DESCRIPTION-->
          <q-card-section class="pb-0 comm-description-card" data-testid="comm-details-comm-description-section">
            <div class="fs-13 my-2 text-grey-90"
                 v-if="communication.type === CommunicationTypes.CALL">
              <span>{{ callDescriptionText }}</span>

            {{ communication.disposition_status2 | translateDispositionStatusText | replaceDash }}.
          </div>

          </q-card-section>

          <q-card-section class="pt-0 pb-0"
                          v-if="communication?.contact"
                          data-testid="comm-details-contact-section">
            <!--CONTACT-->
            <b-form-row data-testid="comm-details-contact-row">
              <b-col class="pl-0 pr-0">
                <q-item-label>Contact: </q-item-label>
              </b-col>
              <b-col>
                <router-link :to="getContactRouteLink(communication)"
                             data-testid="comm-details-contact-router-link">
                  {{ communication.contact.name | fixContactName }}
                </router-link>

              </b-col>
            </b-form-row>
            <hr/>

            <!--DISPOSITION-->
            <b-form-row data-testid="comm-details-disposition-row">
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
            <b-form-row data-testid="comm-details-disposition-row">
              <b-col class="pl-0 pr-0" data-testid="comm-details-disposition-col">
                <q-item-label>From: </q-item-label>
              </b-col>
              <b-col data-testid="comm-details-disposition-col">
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
                  <div>
                    <div class="flex items-center mr-1 h-100"
                         v-if="usedCampaign?.id"
                         data-testid="comm-details-disposition-click-more-info"
                         @click="onOpenLineInClassicClicked(usedCampaign?.id)">
                      <q-tooltip anchor="top middle"
                                 self="bottom middle"
                                 max-width="150px"
                                 data-testid="comm-details-disposition-click-more-info-tooltip">
                        Click for more info
                      </q-tooltip>
                      <span class="text-blue cursor-pointer">
                        {{ usedCampaign?.name }}
                      </span>
                    </div>
                    {{ communication.incoming_number }}
                  </div>
                </div>
                <div class="d-flex align-items-center"
                     v-else>
                  <div>
                    <div class="flex items-center mr-1 h-100 w-100"
                         v-if="usedCampaign?.id"
                         data-testid="comm-details-disposition-click-more-info"
                         @click="onOpenLineInClassicClicked(usedCampaign?.id)">
                      <q-tooltip anchor="top middle"
                                 self="bottom middle"
                                 max-width="150px">
                        Click for more info
                      </q-tooltip>
                      <span class="text-blue cursor-pointer">
                        {{ usedCampaign?.name }}
                      </span>
                    </div>
                    {{ communication.incoming_number | fixPhone }}
                  </div>
                </div>
              </b-col>
            </b-form-row>
          </q-card-section>
          <q-card-section class="pt-0 pb-0" data-testid="comm-details-card-section">
            <b-form-row data-testid="comm-details-disposition-row">
              <b-col class="pl-0 pr-0" data-testid="comm-details-disposition-col">
                <q-item-label>To: </q-item-label>
              </b-col>
              <b-col data-testid="comm-details-disposition-col">
                <div class="d-flex align-items-center"
                     v-if="communication.direction === CommunicationDirections.INBOUND && communication.type !== CommunicationTypes.EMAIL">
                  <div>
                      <div class="flex items-center mr-1 h-100"
                           v-if="usedCampaign?.id"
                           data-testid="comm-details-disposition-click-more-info"
                           @click="onOpenLineInClassicClicked(usedCampaign?.id)">
                      <q-tooltip anchor="top middle"
                                 self="bottom middle"
                                 max-width="150px"
                                 data-testid="comm-details-disposition-tooltip">
                        Click for more info
                      </q-tooltip>
                      <span class="text-blue cursor-pointer">
                        {{ usedCampaign?.name }}
                      </span>
                    </div>
                    {{ communication.incoming_number | fixPhone }}
                  </div>
                </div>
                <div class="d-flex align-items-center"
                     v-else-if="communication.direction === CommunicationDirections.INBOUND && communication.type === CommunicationTypes.EMAIL">
                  <div>
                    <div class="flex items-center mr-1 h-100"
                         v-if="usedCampaign?.id"
                         data-testid="comm-details-disposition-click-more-info"
                         @click="onOpenLineInClassicClicked(usedCampaign?.id)">
                      <q-tooltip anchor="top middle"
                                 self="bottom middle"
                                 max-width="150px">
                        Click for more info
                      </q-tooltip>
                      <span class="text-blue cursor-pointer">
                        {{ usedCampaign?.name }}
                      </span>
                      {{ communication.incoming_number }}
                    </div>
                  </div>
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
              <b-form-row data-testid="comm-details-disposition-row">
                <b-col class="pl-0 pr-0" data-testid="comm-details-disposition-col">
                  <q-item-label class="mt-2">
                    Target Users <span v-if="communication.target_users && communication.target_users.length">({{ attemptLabel }})</span>:
                  </q-item-label>
                </b-col>
                <b-col>
                  <target-users-tree class="w-100"
                                     :communication="communication"
                                     :show-label="false"
                                     data-testid="comm-details-disposition-target-users-tree"/>
                </b-col>
              </b-form-row>
              <hr/>
            </div>

            <div v-if="[CommunicationTypes.CALL, CommunicationTypes.SMS, CommunicationTypes.EMAIL, CommunicationTypes.NOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)">
              <b-form-row data-testid="comm-details-disposition-row">
              <b-col class="pl-0 pr-0">
                <q-item-label>User: </q-item-label>
              </b-col>
              <b-col>
                <q-icon class="status-icon d-inline-block text-danger"
                        :state="communication.rejected_by_app"
                        :name="rejectionToIcon(communication.rejected_by_app)"
                        v-if="communication.rejected_by_app !== 0">
                  <q-tooltip anchor="top middle"
                             self="bottom middle"
                             max-width="150px"
                             data-testid="comm-details-tooltip">
                    {{ rejectionTooltipData(communication.rejected_by_app, communication.type) }}
                  </q-tooltip>
                </q-icon>
                <div v-else-if="getUser(communication.user_id) && getUser(communication.user_id).id">
                  <div class="flex items-center mr-1 h-100"
                       data-testid="comm-details-open-users"
                       @click="onOpenUserInClassicClicked(communication?.user_id)">
                    <span class="text-blue cursor-pointer"
                          :title="getUserName(getUser(communication.user_id))">
                      <q-tooltip class="item"
                                 content-class="bg-grey-light11"
                                 anchor="top left"
                                 self="center middle"
                                 data-testid="comm-details-click-more-info-tooltip">
                        Click For More Info
                      </q-tooltip>
                      {{ getUserName(getUser(communication.user_id)) }}
                    </span>
                  </div>
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
              <b-form-row data-testid="comm-details-row">
                <b-col class="pl-0 pr-0">
                  <q-item-label>Attempting Users: </q-item-label>
                </b-col>
                <b-col>
                  <ul class="list list-unstyled inset mb-0">
                    <li class="pb-1"
                        :key="attemptingUser + '-user-' + index"
                        v-for="(attemptingUser, index) in communication.attempting_users">
                      <div class="flex items-center mr-1 h-100"
                           @click="onOpenUserInClassicClicked(getUser(attemptingUser).id)">
                        <span class="text-blue cursor-pointer"
                              :class="getAttemptingClass(attemptingUser, communication.disposition_status2, communication.user_id)"
                              :title="getUserName(getUser(attemptingUser))">
                          {{ getUserName(getUser(attemptingUser)) }}
                        </span>
                      </div>
                    </li>
                  </ul>
                </b-col>
              </b-form-row>
              <hr/>
            </div>

            <div v-if="communication.type === CommunicationTypes.CALL && communication.metadata && communication.metadata.reports">
              <b-form-row>
                <b-col class="pl-0 pr-0">
                  <q-item-label>Answered with Fishing Mode: </q-item-label>
                </b-col>
                <b-col>
                  <div class="d-flex align-items-center">
                    {{ communication.metadata.reports.is_fishing ? 'Yes' : 'No' }}
                  </div>
                </b-col>
              </b-form-row>

              <b-form-row>
                <b-col class="pl-0 pr-0">
                  <q-item-label>Barged: </q-item-label>
                </b-col>
                <b-col>
                  <div class="d-flex align-items-center">
                    {{ communication.metadata.reports.is_barge ? 'Yes' : 'No' }}
                  </div>
                </b-col>
              </b-form-row>

              <b-form-row>
                <b-col class="pl-0 pr-0">
                  <q-item-label>Whispered: </q-item-label>
                </b-col>
                <b-col>
                  <div class="d-flex align-items-center">
                    {{ communication.metadata.reports.is_whisper ? 'Yes' : 'No' }}
                  </div>
                </b-col>
              </b-form-row>

              <b-form-row>
                <b-col class="pl-0 pr-0">
                  <q-item-label>Queued: </q-item-label>
                </b-col>
                <b-col>
                  <div class="d-flex align-items-center">
                    {{ communication.metadata.reports.is_queued ? 'Yes' : 'No' }}
                  </div>
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
          <q-card-section class="pt-0 pb-0" data-testid="comm-details-card-section">
            <div v-if="communication.type === CommunicationTypes.SMS">
              <b-form-row data-testid="comm-details-current-status-row">
                <b-col class="pl-0 pr-0" data-testid="comm-details-current-status-col">
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

          <q-card-section class="pt-0 pb-0" data-testid="comm-details-card-section">
            <!--TALK TIME-->
            <div v-if="communication.type === CommunicationTypes.CALL">
              <b-form-row data-testid="comm-details-talk-time-form-row">
                <b-col class="pl-0 pr-0" data-testid="comm-details-talk-time-form-col">
                  <q-item-label>Talk Time: </q-item-label>
                </b-col>
                <b-col data-testid="comm-details-talk-time-form-col">
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

          <q-card-section class="pt-0 pb-0"
                          v-if="typeHaveLine"
                          data-testid="comm-details-card-section">
            <!--RING GROUP-->
            <b-form-row v-if="communication.ring_group_id" data-testid="comm-details-ring-group-row">
              <b-col class="pl-0 pr-0" data-testid="comm-details-ring-group-col">
                <q-item-label>Ring Group: </q-item-label>
              </b-col>
              <b-col data-testid="comm-details-ring-group-col">
                <div class="d-flex align-items-center">
                  <div class="flex items-center mr-1 h-100"
                       data-testid="comm-details-ring-group-open-rg-in-classic"
                       @click="onOpenRingGroupInClassicClicked(communication?.ring_group_id)"
                       v-if="usedRingGroup && !usedRingGroup?.call_waiting">
                    <span class="text-blue cursor-pointer"
                          :title="usedRingGroup.name">
                      <q-tooltip anchor="top middle"
                                 self="bottom middle"
                                 max-width="150px"
                                 data-testid="comm-details-ring-group-tooltip">
                        Click For More Info
                      </q-tooltip>
                      {{ usedRingGroup.name }}
                    </span>
                  </div>
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
            <b-form-row v-if="communication.workflow_id" data-testid="comm-details-sequence-row">
              <b-col class="pl-0 pr-0" data-testid="comm-details-sequence-col">
                <q-item-label>Sequence: </q-item-label>
              </b-col>
              <b-col data-testid="comm-details-sequence-col">
                <div class="d-flex align-items-center">
                  <div class="flex items-center mr-1 h-100"
                       data-testid="comm-details-sequence-open-sequence-in-classic"
                       @click="onOpenSequenceInClassicClicked(useSequence?.id)"
                       v-if="useSequence">
                    <span class="text-blue cursor-pointer"
                          :title="useSequence?.name">
                      <q-tooltip anchor="top middle"
                                 self="bottom middle"
                                 max-width="150px"
                                 data-testid="comm-details-sequence-tooltip">
                        Click For More Info
                      </q-tooltip>
                      {{ useSequence?.name }}
                    </span>
                  </div>
                  <template v-else>
                    Deleted Sequence
                  </template>
                </div>
              </b-col>
            </b-form-row>

            <!--BROADCAST-->
            <b-form-row v-if="communication.broadcast_id" data-testid="comm-details-broadcast-row">
              <b-col class="pl-0 pr-0" data-testid="comm-details-broadcast-col">
                <q-item-label>Broadcast: </q-item-label>
              </b-col>
              <b-col data-testid="comm-details-broadcast-col">
                <div class="d-flex align-items-center">
                  <div class="flex items-center mr-1 h-100"
                       data-testid="comm-details-broadcast-open-broadcast-in-classic"
                       @click="onOpenBroadcastInClassicClicked(communication.broadcast_id)"
                       v-if="useBroadCast">
                    <span class="text-blue cursor-pointer"
                          :title="useBroadCast.name">
                      <q-tooltip anchor="top middle"
                                 self="bottom middle"
                                 data-testid="comm-details-broadcast-tooltip"
                                 max-width="150px">
                        Click For More Info
                      </q-tooltip>
                      {{ useBroadCast.name }}
                    </span>
                  </div>
                  <template v-else>
                    Deleted Broadcast
                  </template>
                </div>
              </b-col>
            </b-form-row>

            <!--TRANSFERRED FROM-->
            <b-form-row v-if="communication.transfer_prior_user_ids" data-testid="comm-details-transferred-from-row">
              <b-col class="pl-0 pr-0" data-testid="comm-details-transferred-from-col">
                <q-item-label>Transferred from: </q-item-label>
              </b-col>
              <b-col data-testid="comm-details-transferred-from-col">
                <div class="d-flex align-items-center">
                  <div class="flex items-center mr-1 h-100"
                       :key="userId + '-user-' + index"
                       data-testid="comm-details-transferred-from-open-user-in-classic"
                       @click="onOpenUserInClassicClicked(userId)"
                       v-for="(userId, index) in communication.transfer_prior_user_ids">
                    <span class="text-blue cursor-pointer"
                          :title="getUserName(getUser(userId))">
                      <q-tooltip class="item"
                                 content-class="bg-grey-light11"
                                 anchor="top middle"
                                 data-testid="comm-details-transferred-from-tooltip"
                                 self="bottom middle">
                        {{ getUserName(getUser(userId)) }}
                      </q-tooltip>
                      {{ getUserName(getUser(userId)) }}
                    </span>
                  </div>
                </div>
              </b-col>
            </b-form-row>

            <!--TRANSFERRED TO-->
            <b-form-row v-if="communication.transfer_target_user_ids" data-testid="comm-details-transferred-to-row">
              <b-col class="pl-0 pr-0" data-testid="comm-details-transferred-to-col">
                <q-item-label>Transferred to: </q-item-label>
              </b-col>
              <b-col data-testid="comm-details-transferred-to-col">
                <div class="d-flex align-items-center">
                  <div class="flex items-center mr-1 h-100"
                       :key="userId + '-user-' + index"
                       data-testid="comm-details-transferred-to-open-user-in-classic"
                       @click="onOpenUserInClassicClicked(userId)"
                       v-for="(userId, index) in communication.transfer_target_user_ids">
                    <span class="text-blue cursor-pointer"
                          :title="getUserName(getUser(userId))">
                      <q-tooltip class="item"
                                 content-class="bg-grey-light11"
                                 anchor="top middle"
                                 data-testid="comm-details-transferred-to-tooltip"
                                 self="bottom middle">
                        {{ getUserName(getUser(userId)) }}
                      </q-tooltip>
                      {{ getUserName(getUser(userId)) }}
                    </span>
                  </div>
                </div>
              </b-col>
            </b-form-row>

            <!--COLD TRANSFER-->
            <b-form-row v-if="communication.transfer_target_user_ids" data-testid="comm-details-cold-transfer-row">
              <b-col class="pl-0 pr-0" data-testid="comm-details-cold-transfer-col">
                <q-item-label>Cold transferred: </q-item-label>
              </b-col>
              <b-col data-testid="comm-details-cold-transfer-col">
                <div class="d-flex align-items-center">
                  {{ communication.in_cold_transfer | fixBooleanType }}
                </div>
              </b-col>
            </b-form-row>

            <!--CHILD CALL - NEW-->
            <b-form-row v-if="communication.metadata && communication.metadata.new_communication_id"
                        data-testid="comm-details-new-row">
              <b-col class="pl-0 pr-0" data-testid="comm-details-new-col">
                <q-item-label>Child Call: </q-item-label>
              </b-col>
              <b-col data-testid="comm-details-new-col">
                <div class="d-flex align-items-center">
                  <router-link :to="{ name: 'Communication', params: {contactId: communication.contact_id, communicationId: communication.metadata.new_communication_id }}"
                                data-testid="comm-details-new-more-info-link">
                    More info
                  </router-link>
                </div>
              </b-col>
            </b-form-row>

            <!--PARENT CALL - ORIGINAL-->
            <b-form-row v-if="communication.metadata && communication.metadata.original_communication_id"
                        data-testid="comm-details-original-row">
              <b-col class="pl-0 pr-0" data-testid="comm-details-original-col">
                <q-item-label>Parent Call: </q-item-label>
              </b-col>
              <b-col data-testid="comm-details-original-col">
                <div class="d-flex align-items-center">
                  <router-link :to="{ name: 'Communication', params: {contactId: communication.contact_id, communicationId: communication.metadata.original_communication_id }}"
                               data-testid="comm-details-original-more-info-link">
                    More info
                  </router-link>
                </div>
              </b-col>
            </b-form-row>

            <!--CHILD CALL - ACTIVE-->
            <b-form-row v-if="communication.metadata && communication.metadata.active_communication_id"
                        data-testid="comm-details-child-row">
              <b-col class="pl-0 pr-0" data-testid="comm-details-child-col">
                <q-item-label>Child Call: </q-item-label>
              </b-col>
              <b-col data-testid="comm-details-child-col">
                <div class="d-flex align-items-center">
                  <router-link :to="{ name: 'Communication', params: {contactId: communication.contact_id, communicationId: communication.metadata.active_communication_id }}"
                               data-testid="comm-details-child-more-info-row">
                    More info
                  </router-link>
                </div>
              </b-col>
            </b-form-row>

            <!--PARENT CALL - FAKE-->
            <b-form-row v-if="communication.metadata && communication.metadata.fake_communication_id"
                        data-testid="comm-details-fake-row">
              <b-col class="pl-0 pr-0" data-testid="comm-details-fake-col">
                <q-item-label>Parent Call: </q-item-label>
              </b-col>
              <b-col data-testid="comm-details-fake-col">
                <div class="d-flex align-items-center">
                  <router-link :to="{ name: 'Communication', params: {contactId: communication.contact_id, communicationId: communication.metadata.fake_communication_id }}"
                                data-testid="comm-details-fake-more-info-link">
                    More info
                  </router-link>
                </div>
              </b-col>
            </b-form-row>

            <!--RECEIVED/SENT BY-->
            <b-form-row v-if="getUser(communication.user_id) && communication.type === CommunicationTypes.SMS"
                        data-testid="comm-details-sent-by-row">
              <b-col class="pl-0 pr-0" data-testid="comm-details-sent-by-col">
                <q-item-label v-if="communication.direction === CommunicationDirections.INBOUND">
                  Received by:
                </q-item-label>
                <q-item-label v-else>
                  Sent by:
                </q-item-label>
              </b-col>
              <b-col data-testid="comm-details-sent-by-col">
                <div class="d-flex align-items-center">
                  {{ getUser(communication.user_id).name }}
                </div>
              </b-col>
            </b-form-row>

            <!--RECORDING-->
            <b-form-row v-if="communication.type === CommunicationTypes.CALL" data-testid="comm-details-recording-card">
              <b-col class="pl-0 pr-0" data-testid="comm-details-recording-col">
                <q-item-label class="mt-3 custom-item-label">Recording: </q-item-label>
              </b-col>
              <b-col data-testid="comm-details-recording-col">
                <div class="d-flex align-items-center"
                     v-if="showAudio(communication)">
                  <communication-audio class="mb-2"
                                       data-testid="comm-details-recording-comm-audio"
                                       :communication="communication"
                                       :type="UploadedFileTypes.TYPE_CALL_RECORDING"
                                       :uniqueId="communication.id + '1'"/>
                </div>
                <div class="d-flex align-items-center mt-3"
                     v-else>
                  No Call Recording
                </div>
              </b-col>
            </b-form-row>

            <!--VM-->
            <b-form-row v-if="[CommunicationTypes.CALL, CommunicationTypes.RVM].includes(communication.type)"
                        data-testid="comm-details-vm-card">
              <b-col class="pl-0 pr-0" data-testid="comm-details-vm-col">
                <q-item-label>Voicemail: </q-item-label>
              </b-col>
              <b-col>
                <div class="d-flex align-items-center"
                     v-if="communication.has_voicemail">
                  <communication-audio class="mb-2"
                                       data-testid="comm-details-vm-comm-audio"
                                       :communication="communication"
                                       :type="UploadedFileTypes.TYPE_CALL_VOICEMAIL"
                                       :uniqueId="communication.id + '2'"/>
                </div>
                <div class="d-flex align-items-center"
                     data-testid="comm-details-vm-no-voicemail"
                     v-else>
                  No Voicemail
                </div>
              </b-col>
            </b-form-row>
          </q-card-section>

          <!--FILES HERE-->
          <q-card-section class="pt-0 pb-0"
                          v-if="typeHaveAttachments"
                          data-testid="comm-details-files-card">
            <b-form-row data-testid="comm-details-files-row">
              <b-col class="pl-0 pr-0">
                <q-item-label>Files: </q-item-label>
              </b-col>

              <b-col>
                <div class="text-dark-greenish w-100"
                     :key="index"
                     v-for="(attachment, index) in communication.attachments">
                  <download-button is-simple
                                   show-file-name
                                   data-testid="comm-details-files-download-btn"
                                   :communication-id="communication.id"
                                   :filename="attachment.name"
                                   :file-mime-type="attachment.mime_type"
                                   :attachment-url="attachment.url"/>
                </div>
              </b-col>
            </b-form-row>
          </q-card-section>

          <!--NOTES-->
          <q-card-section class="pt-0 pb-0" data-testid="comm-details-notes-card">
            <b-form-row data-testid="comm-details-row">
              <b-col class="pl-0 pr-0">
                <q-item-label>Notes: </q-item-label>
              </b-col>
              <b-col>
                <div class="align-items-center"
                     v-if="!isEditingNote">
                  <div class="notes mt-1"
                       v-html="$options.filters.nl2br(communication.notes)"/>
                  <b-link href="#"
                          class="custom-link text-decoration-none btn-tag-edit d-flex align-items-center"
                          data-testid="comm-details-link-edit-note"
                          @click="onEditNote">
                    <slot name="button">
                      <span>
                        {{ (!communication.notes || !communication.notes.trim().length) ? 'Add' : 'Edit' }} Note
                      </span>
                    </slot>
                  </b-link>
                </div>
                <div class="d-flex align-items-center"
                     v-if="isEditingNote">
                  <communication-note ref="communicationNotes"
                                      :communication="communication"
                                      data-testid="comm-details-comm-note"
                                      @notesBlurred="isEditingNote = false"/>
                </div>
              </b-col>
            </b-form-row>
          </q-card-section>

          <!-- CREATOR TYPE -->
          <q-card-section class="pt-0 pb-0" data-testid="comm-details-creator-type-card">
            <b-form-row data-testid="comm-details-creator-type-row">
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

          <q-card-section class="pt-0 pb-0" data-testid="comm-details-tags-card">
            <!--TAGS-->
            <b-form-row data-testid="comm-details-tags-row">
              <b-col class="pl-0 pr-0">
                <q-item-label>Tags: </q-item-label>
              </b-col>
              <b-col>
                <div class="d-flex align-items-center">
                  <entity-tags data-testid="communication-tags-multi-select"
                               entity="communication"
                               entity-type="contacts"
                               :entity-object="communication"
                               :category="TagCategories.CAT_COMMUNICATIONS"
                               :use-card="false"
                               :use-add-icon="true" />
                </div>
              </b-col>
            </b-form-row>
          </q-card-section>

          <!--CALL DISPOSITION-->
          <q-card-section class="pt-0 pb-0"
                          v-if="isCallAndHaveCallDisposition"
                          data-testid="comm-details-call-disposition-card">
            <b-form-row data-testid="comm-details-call-disposition-row">
              <b-col class="pl-0 pr-0" data-testid="comm-details-call-disposition-col">
                <q-item-label class="mt-3 custom-item-label" data-testid="comm-details-call-disposition-item">Call Disposition: </q-item-label>
              </b-col>
              <b-col data-testid="comm-details-call-disposition-col">
                <div class="d-flex align-items-center">
                  <call-disposition-selector data-testid="comm-details-disposition-selector" :communication="communication"/>
                </div>
              </b-col>
            </b-form-row>
            <b-form-row v-if="currentCompany.hubspot_integration_enabled" data-testid="comm-details-call-disposition-row">
              <b-col class="pl-0 pr-0">
                <q-item-label class="mt-3 custom-item-label">HubSpot Type: </q-item-label>
              </b-col>
              <b-col>
                <div class="d-flex align-items-center">
                  <hubspot-activity-type-selector data-testid="comm-details-call-disposition-hubspot" :communication="communication"></hubspot-activity-type-selector>
                </div>
              </b-col>
            </b-form-row>
          </q-card-section>
        </q-card>
      </b-col>
      <b-col :md="isWidget ? 12 : 8"
             class="pr-0 ring-group-snapshot-wrapper"
             data-testid="comm-details-col"
             v-if="communication && communication.type === CommunicationTypes.CALL">
        <ring-group-snapshot data-testid="comm-details-ring-group-snapshot"
                             :communication="communication"
                             :ring-group="usedRingGroup"
                             v-if="usedRingGroup"/>
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
import { TAG_CATEGORIES as TagCategories } from 'src/constants/tag-categories'

import talk2Api from 'src/plugins/api/api'
import TargetUsersTree from 'components/target-users-tree'
import CommunicationAudio from 'components/communication-audio'
import CommunicationNote from 'components/communication-note'
import CallDispositionSelector from 'components/call-disposition-selector'

import RingGroupSnapshot from 'components/ring-group-snapshot'
import PredefinedTimeDurationSelector from 'components/predefined-time-duration-selector'
import PencilOIcon from 'components/icons/pencil-o-icon'
import DownloadButton from 'components/download-button'
import TranscriptionModal from 'src/components/communication/transcription-modal'
import * as CommunicationCallbackStatus from '../constants/callback-status'
import HubspotActivityTypeSelector from 'components/hubspot-activity-type-selector'
import EntityTags from 'components/generic-selectors/entity-tags'

export default {
  name: 'communication-details',

  components: {
    HubspotActivityTypeSelector,
    PencilOIcon,
    PredefinedTimeDurationSelector,
    RingGroupSnapshot,
    CallDispositionSelector,
    CommunicationNote,
    CommunicationAudio,
    TargetUsersTree,
    DownloadButton,
    TranscriptionModal,
    EntityTags
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
      CommunicationCallbackStatus,
      TagCategories
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
    ...mapState(['campaigns', 'workflows', 'ringGroups', 'callDispositions', 'isWidget']),
    ...mapState('cache', ['currentCompany']),
    ...mapState('broadcast', ['broadcasts']),
    usedCampaign () {
      if (!this.communication.campaign_id) {
        return null
      }

      const communicationIncomingNumber = _.get(this.communication, 'incoming_number', null)
      if (!communicationIncomingNumber) {
        return null
      }

      return this.getCampaign(this.communication.campaign_id)
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
    },

    typeAcceptAttachment () {
      return [CommunicationTypes.SMS, CommunicationTypes.EMAIL, CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(this.communication.type)
    },

    typeHaveLine () {
      return ![CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(this.communication.type)
    },

    typeHaveAttachments () {
      return [CommunicationTypes.FAX, CommunicationTypes.EMAIL].includes(this.communication.type) &&
        this.communication.attachments &&
        this.communication.attachments.length > 0
    },

    isCallAndHaveCallDisposition () {
      return this.communication.type === CommunicationTypes.CALL &&
        this.currentCompany &&
        this.callDispositions &&
        this.callDispositions.length > 0 &&
        !this.dialerMode
    }
  },

  methods: {
    getContactRouteLink (communication) {
      if (this.isWidget) {
        return { name: 'Texting Widget (unknown-user)', params: { id: communication.contact.id } }
      }

      return { name: 'Contact', params: { id: communication.contact.id } }
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

    getClassicUrlUserActivity (userId) {
      return process.env.API_URL + `/users/${userId}/activity`
    },

    getClassicUrlSequenceActivity (sequenceId) {
      return process.env.API_URL + `/sequences2/manager/${sequenceId}`
    },

    getClassicUrlRingGroupActivity (ringGroupId) {
      return process.env.API_URL + `/ring-groups/${ringGroupId}/activity`
    },

    getClassicUrlBroadcastActivity (broadcastId) {
      return process.env.API_URL + `/broadcast/${broadcastId}/activity`
    },

    getClassicUrlLineActivity (campaignId) {
      return process.env.API_URL + `/lines/${campaignId}/activity`
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

    onOpenLineInClassicClicked (campaignId) {
      window.open(this.getClassicUrlLineActivity(campaignId), '_blank')
    },

    onOpenUserInClassicClicked (userId) {
      window.open(this.getClassicUrlUserActivity(userId), '_blank')
    },

    onOpenSequenceInClassicClicked (sequenceId) {
      window.open(this.getClassicUrlSequenceActivity(sequenceId), '_blank')
    },

    onOpenRingGroupInClassicClicked (ringGroupId) {
      window.open(this.getClassicUrlRingGroupActivity(ringGroupId), '_blank')
    },

    onOpenBroadcastInClassicClicked (broadcastId) {
      window.open(this.getClassicUrlBroadcastActivity(broadcastId), '_blank')
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
