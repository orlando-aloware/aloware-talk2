<template>
  <div v-if="communication">
    <el-collapse v-model="activeName"
                 class="border-0 contact-activity"
                 accordion>
      <el-collapse-item name="main">
        <template slot="title">
          <div class="text-lt p-x">
                        <span>
                            <el-tooltip class="item"
                                        effect="dark"
                                        v-if="communication.disposition_status2"
                                        :content="communication.disposition_status2 | translateDispositionStatusText | replaceDash | capitalize"
                                        placement="bottom">
                                <span class="mr-2"
                                      :state="communication.disposition_status2"
                                      v-html="stateToIcon(communication.disposition_status2, communication.direction, communication.type)">
                                </span>
                            </el-tooltip>

                            <span v-if="![CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)">{{ communication.direction | fixCommDirection }}</span>
                            {{ communication.type | fixCommType }}
                        </span>
            <span v-if="communication.type === CommunicationTypes.CALL && activity_mode">
                            - {{ communication.duration | fixDuration }}
                        </span>
          </div>
        </template>

        <div class="p-a b-t b-light">
          <template
            v-if="[CommunicationTypes.SMS, CommunicationTypes.EMAIL, CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)">
            <vue-load-image
              v-if="[CommunicationTypes.SMS, CommunicationTypes.NOTE].includes(communication.type) && communication.attachments && communication.attachments.length > 0"
              v-for="(image, index) in communication.attachments"
              :key="index">
              <img slot="image"
                   class="img-fluid d-block r-2x"
                   :class="index > 0 ? 'mb-1' : ''"
                   :src="image.url"/>
              <img slot="preloader"
                   src="/assets/images/loading.svg"/>
              <div slot="error">Error!</div>
            </vue-load-image>

            <div v-if="communication.body">
                            <span class="text-muted"
                                  v-if="communication.type !== CommunicationTypes.SMS"
                                  v-html="$options.filters.nl2br(communication.body)"
                                  v-linkified:options="{ target: '_blank' }">
                            </span>
              <span class="text-muted"
                    v-else
                    v-linkified:options="{ target: '_blank' }">
                                {{ communication.body }}
                            </span>
            </div>
          </template>

          <span class="text-muted"
                v-if="communication.type === CommunicationTypes.CALL">
                        This call {{ communication.disposition_status2 === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW ? 'is' : 'was' }} {{ communication.disposition_status2 | translateDispositionStatusText | replaceDash }}.
                    </span>

          <div class="form-horizontal b-b mt-2"
               v-if="communication.type === CommunicationTypes.CALL && current_company && call_dispositions.length > 0 && dialer_mode">
            <div class="form-group mb-2 mt-3">
              <div class="d-flex align-items-center">
                <label class="form-control-label p-0">Call Disposition:</label>
                <el-popover placement="right"
                            class="ml-1"
                            width="200"
                            trigger="click"
                            v-if="current_company.force_call_disposition"
                            content="Your account admin has mandated call dispositions.">
                  <el-button type="text"
                             class="p-0"
                             slot="reference">
                    <i class="el-icon-info text-danger"></i>
                  </el-button>
                </el-popover>
              </div>
              <div class="d-flex align-items-center pt-2">
                <call-disposition-selector :communication="communication"
                                           @callDisposed="callDisposed">
                </call-disposition-selector>
              </div>
            </div>
          </div>

          <div class="form-horizontal b-b mt-2"
               v-if="verbose || display_contact">
            <div class="form-group row mb-0"
                 v-if="communication.contact">
              <label :class="[dialer_mode ? 'col-5' : 'col-xl-5 col-12']"
                     class="form-control-label">Contact:</label>
              <div :class="[dialer_mode ? 'col-7' : 'col-xl-7 col-12']"
                   class="d-flex align-items-center">
                <router-link :to="{ name: 'Contact', params: { contact_id: communication.contact_id }}"
                             :target="is_widget ? '_blank' : '_self'">
                  <el-tooltip class="item pull-left"
                              effect="dark"
                              content="Click For More Info"
                              placement="top">
                                        <span class="text-dark-greenish">
                                            {{ communication.contact.name | fixContactName }}
                                        </span>
                  </el-tooltip>
                </router-link>
              </div>
            </div>

            <div class="form-group mb-2"
                 v-if="communication.contact && disposition_statuses.length > 0 && dialer_mode && !hide_contact_disposition">
              <label v-if="hasPermissionTo('dispose contact')"
                     class="form-control-label p-0">Contact Disposition:</label>
              <el-popover v-if="current_company.force_contact_disposition"
                          class="ml-1"
                          content="Your account admin has mandated contact dispositions."
                          placement="right"
                          trigger="click"
                          width="200">
                <el-button slot="reference"
                           class="p-0"
                           type="text">
                  <i class="el-icon-info text-danger"></i>
                </el-button>
              </el-popover>
              <div v-if="hasPermissionTo('dispose contact')"
                   class="d-flex align-items-center pt-2">
                <contact-disposition-selector :key="'contact-disposition-' + communication.contact.id"
                                              :contact="communication.contact"
                                              @contactDisposed="contactDisposed">
                </contact-disposition-selector>
              </div>
            </div>
          </div>

          <div class="form-horizontal b-b mt-2"
               v-if="dialer_mode">
            <div class="form-group mb-2">
              <label class="form-control-label p-0">Send message:</label>
              <send-template :contact_id="communication.contact_id"
                             :campaign_id="communication.campaign_id"
                             :phone_number="communication.lead_number">
              </send-template>
            </div>
          </div>

          <div class="form-horizontal b-b a"
               v-if="(verbose || activity_mode) && ![CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type) && !dialer_mode">
            <div class="form-group row mb-0">
              <label class="form-control-label col-xl-5 col-12">Disposition:</label>
              <div class="d-flex align-items-center col-xl-7 col-12">
                {{ communication.disposition_status2 | translateDispositionStatusText | replaceDash |
                capitalize }}
              </div>
            </div>
          </div>

          <div class="form-horizontal"
               v-if="(verbose || activity_mode) && ![CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)">
            <div class="form-group row mb-0">
              <label :class="[dialer_mode ? 'col-5' : 'col-xl-5 col-12']"
                     class="form-control-label">From:</label>
              <div :class="[dialer_mode ? 'col-7' : 'col-xl-7 col-12']"
                   class="d-flex align-items-center"
                   v-if="communication.direction === CommunicationDirections.INBOUND && communication.type !== CommunicationTypes.EMAIL">
                {{ communication.lead_number | fixPhone }}
              </div>
              <div :class="[dialer_mode ? 'col-7' : 'col-xl-7 col-12']"
                   class="d-flex align-items-center"
                   v-else-if="communication.direction === CommunicationDirections.INBOUND && communication.type === CommunicationTypes.EMAIL">
                {{ communication.lead_number }}
              </div>
              <div :class="[dialer_mode ? 'col-7' : 'col-xl-7 col-12']"
                   class="d-flex align-items-center"
                   v-else-if="communication.direction === CommunicationDirections.OUTBOUND && communication.type === CommunicationTypes.EMAIL">
                {{ communication.incoming_number }}
              </div>
              <div :class="[dialer_mode ? 'col-7' : 'col-xl-7 col-12']"
                   class="d-flex align-items-center"
                   v-else>
                {{ communication.incoming_number | fixPhone }}
              </div>
            </div>
          </div>

          <div class="form-horizontal b-b"
               v-if="(verbose || activity_mode) && ![CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)">
            <div class="form-group row mb-0">
              <label :class="[dialer_mode ? 'col-5' : 'col-xl-5 col-12']"
                     class="form-control-label">To:</label>
              <div :class="[dialer_mode ? 'col-7' : 'col-xl-7 col-12']"
                   class="d-flex align-items-center"
                   v-if="communication.direction === CommunicationDirections.INBOUND && communication.type !== CommunicationTypes.EMAIL">
                {{ communication.incoming_number | fixPhone }}
              </div>
              <div :class="[dialer_mode ? 'col-7' : 'col-xl-7 col-12']"
                   class="d-flex align-items-center"
                   v-else-if="communication.direction === CommunicationDirections.INBOUND && communication.type === CommunicationTypes.EMAIL">
                {{ communication.incoming_number }}
              </div>
              <div :class="[dialer_mode ? 'col-7' : 'col-xl-7 col-12']"
                   class="d-flex align-items-center"
                   v-else-if="communication.direction === CommunicationDirections.OUTBOUND && communication.type === CommunicationTypes.EMAIL">
                {{ communication.lead_number }}
              </div>
              <div :class="[dialer_mode ? 'col-7' : 'col-xl-7 col-12']"
                   class="d-flex align-items-center"
                   v-else>
                {{ communication.lead_number | fixPhone }}
              </div>
            </div>
          </div>

          <div class="form-horizontal b-b"
               v-if="communication.type === CommunicationTypes.CALL && !dialer_mode">
            <target-users-tree class="form-group row mb-0 pt-2 pb-2"
                               :communication="communication"
                               :isForm="true" />
          </div>

          <div class="form-horizontal"
               :class="[communication.type !== CommunicationTypes.NOTE ? 'b-b': '']"
               v-if="[CommunicationTypes.CALL, CommunicationTypes.SMS, CommunicationTypes.EMAIL, CommunicationTypes.NOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)">
            <div class="form-group row mb-0 pt-2 pb-2"
                 v-if="communication.type !== CommunicationTypes.NOTE">
              <label :class="[dialer_mode ? 'col-5' : 'col-xl-5 col-12']"
                     class="form-control-label">User:</label>
              <div :class="[dialer_mode ? 'col-7' : 'col-xl-7 col-12']"
                   class="d-flex align-items-center">
                <el-tooltip class="item"
                            effect="dark"
                            popper-class="rejection-tooltip"
                            :content="rejectionTooltipData(communication.rejected_by_app)"
                            placement="top"
                            v-if="communication.rejected_by_app !== 0">
                  <div :state="communication.rejected_by_app"
                       class="status-icon d-inline-block"
                       v-html="rejectionToIcon(communication.rejected_by_app)">
                  </div>
                </el-tooltip>
                <div v-else-if="getUser(communication.user_id) && getUser(communication.user_id).id">
                  <router-link
                    :to="{ name: 'User Activity', params: {user_id: communication.user_id }}">
                    <el-tooltip class="item pull-left"
                                effect="dark"
                                content="Click For More Info"
                                placement="top">
                      <div>
                                                <span class="text-dark-greenish"
                                                      :title="getUserName(getUser(communication.user_id))">
                                                    {{ getUserName(getUser(communication.user_id)) }}
                                                </span>
                      </div>
                    </el-tooltip>
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
              <label :class="[dialer_mode ? 'col-5' : 'col-xl-5 col-12']"
                     class="form-control-label">Attempting Users:</label>
              <div :class="[dialer_mode ? 'col-7' : 'col-xl-7 col-12']"
                   class="d-flex align-items-center">
                        <span class="text-greyish">
                            <ul class="list list-unstyled inset mb-0">
                                <li v-for="(attempting_user, index) in communication.attempting_users"
                                    :key="attempting_user + '-user-' + index"
                                    v-if="getUser(attempting_user) && getUser(attempting_user).id"
                                    class="pb-1">
                                    <router-link
                                      :to="{ name: 'User Activity', params: {user_id: getUser(attempting_user).id }}">
                                        <span :class="getAttemptingClass(attempting_user, communication.disposition_status2, communication.user_id)"
                                              :title="getUserName(getUser(attempting_user))">
                                            {{ getUserName(getUser(attempting_user)) }}
                                        </span>
                                    </router-link>
                                </li>
                            </ul>
                        </span>
              </div>
            </div>
          </div>

          <div class="form-horizontal"
               v-if="![CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)">
            <div class="form-group row mb-0">
              <label :class="[dialer_mode ? 'col-5' : 'col-xl-5 col-12']"
                     class="form-control-label"
                     v-if="communication.type === CommunicationTypes.CALL">
                Started at:
              </label>
              <label :class="[dialer_mode ? 'col-5' : 'col-xl-5 col-12']"
                     class="form-control-label"
                     v-else>
                Sent at:
              </label>
              <div :class="[dialer_mode ? 'col-7' : 'col-xl-7 col-12']"
                   class="d-flex align-items-center">
                {{ communication.created_at | fixCommunicationDateTime }}
              </div>
            </div>
          </div>

          <div class="form-horizontal b-b"
               v-if="communication.type === CommunicationTypes.SMS">
            <div class="form-group row mb-0">
              <label :class="[dialer_mode ? 'col-5' : 'col-xl-5 col-12']"
                     class="form-control-label">
                Current Status:
              </label>
              <div :class="[dialer_mode ? 'col-7' : 'col-xl-7 col-12']"
                   class="d-flex align-items-center">
                {{ communication.current_status2 !==
              CommunicationCurrentStatus.CURRENT_STATUS_COMPLETED_NEW
                ? $options.filters.translateCurrentStatusText(communication.current_status2) :
                $options.filters.translateDispositionStatusText(communication.disposition_status2) | replaceDash |
                capitalize }}
              </div>
            </div>
          </div>

          <div class="form-horizontal b-b"
               v-if="communication.type === CommunicationTypes.CALL && verbose">
            <div class="form-group row mb-0">
              <label :class="[dialer_mode ? 'col-5' : 'col-xl-5 col-12']"
                     class="form-control-label">Ended at:</label>
              <div :class="[dialer_mode ? 'col-7' : 'col-xl-7 col-12']"
                   class="d-flex align-items-center">
                {{ communication.created_at | fixCommunicationDateTime(communication.duration) }}
              </div>
            </div>
          </div>

          <div class="form-horizontal"
               v-if="[CommunicationTypes.CALL, CommunicationTypes.RVM].includes(communication.type) && verbose">
            <div class="form-group row mb-0">
              <label :class="[dialer_mode ? 'col-5' : 'col-xl-5 col-12']"
                     class="form-control-label">Duration:</label>
              <div :class="[dialer_mode ? 'col-7' : 'col-xl-7 col-12']"
                   class="d-flex align-items-center">
                {{ communication.duration | fixDuration }}
              </div>
            </div>
          </div>

          <div class="form-horizontal"
               v-if="(communication.type === CommunicationTypes.SMS) && verbose">
            <div class="form-group row mb-0">
              <label :class="[dialer_mode ? 'col-5' : 'col-xl-5 col-12']"
                     class="form-control-label">Parts:</label>
              <div :class="[dialer_mode ? 'col-7' : 'col-xl-7 col-12']"
                   class="d-flex align-items-center">
                {{ communication.duration }}
              </div>
            </div>
          </div>

          <div class="form-horizontal b-b"
               v-if="communication.type === CommunicationTypes.CALL">
            <div class="form-group row mb-0">
              <label :class="[dialer_mode ? 'col-5' : 'col-xl-5 col-12']"
                     class="form-control-label">Talk time:</label>
              <div :class="[dialer_mode ? 'col-7' : 'col-xl-7 col-12']"
                   class="d-flex align-items-center">
                {{ communication.talk_time | fixDuration }}
              </div>
            </div>
          </div>

          <div class="form-horizontal b-b"
               v-if="![CommunicationTypes.SMS, CommunicationTypes.RVM, CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type) && verbose">
            <div class="form-group row mb-0">
              <label :class="[dialer_mode ? 'col-5' : 'col-xl-5 col-12']"
                     class="form-control-label">Wait time:</label>
              <div :class="[dialer_mode ? 'col-7' : 'col-xl-7 col-12']"
                   class="d-flex align-items-center">
                <span v-if="communication.disposition_status2 == CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED_NEW">{{ communication.wait_time | fixDuration }}</span>
                <span v-else>-</span>
              </div>
            </div>
          </div>

          <div class="form-horizontal"
               v-if="![CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)">
            <div class="form-group row mb-0">
              <template v-if="communication.campaign_id">
                <label class="form-control-label"
                       :class="[dialer_mode ? 'col-5' : 'col-xl-5 col-12']">
                  Line:
                </label>
                <div :class="[dialer_mode ? 'col-7' : 'col-xl-7 col-12']"
                     class="d-flex align-items-center">
                  <router-link
                    :to="{ name: 'Line Activity', params: { campaign_id: communication.campaign_id }}"
                    v-if="getCampaign(communication.campaign_id)">
                    <el-tooltip class="item pull-left"
                                effect="dark"
                                content="Click For More Info"
                                placement="top">
                                        <span class="text-dark-greenish">
                                            {{ getCampaign(communication.campaign_id).name }}
                                        </span>
                    </el-tooltip>
                  </router-link>
                  <template v-else>
                    Deleted Line
                  </template>
                </div>
              </template>

              <template v-if="communication.ring_group_id">
                <label class="form-control-label"
                       :class="[dialer_mode ? 'col-5' : 'col-xl-5 col-12']">
                  Ring Group:
                </label>
                <div :class="[dialer_mode ? 'col-7' : 'col-xl-7 col-12']"
                     class="d-flex align-items-center">
                  <router-link
                    :to="{ name: 'Ring Group Activity', params: { ring_group_id: communication.ring_group_id }}"
                    v-if="getRingGroup(communication.ring_group_id)">
                    <el-tooltip class="item pull-left"
                                effect="dark"
                                content="Click For More Info"
                                placement="top">
                                        <span class="text-dark-greenish">
                                            {{ getRingGroup(communication.ring_group_id).name }}
                                        </span>
                    </el-tooltip>
                  </router-link>
                  <template v-else>
                    Deleted Ring Group
                  </template>
                </div>
              </template>

              <template v-if="communication.workflow_id">
                <label class="form-control-label"
                       :class="[dialer_mode ? 'col-5' : 'col-xl-5 col-12']">
                  Sequence:
                </label>
                <div :class="[dialer_mode ? 'col-7' : 'col-xl-7 col-12']"
                     class="d-flex align-items-center">
                  <router-link
                    :to="{ name: 'Sequence Activity', params: { workflow_id: communication.workflow_id }}"
                    v-if="getWorkflow(communication.workflow_id)">
                    <el-tooltip class="item pull-left"
                                effect="dark"
                                content="Click For More Info"
                                placement="top">
                                        <span class="text-dark-greenish">
                                            {{ getWorkflow(communication.workflow_id).name }}
                                        </span>
                    </el-tooltip>
                  </router-link>
                  <template v-else>
                    Deleted Sequence
                  </template>
                </div>
              </template>

              <template v-if="communication.broadcast_id">
                <label class="form-control-label"
                       :class="[dialer_mode ? 'col-5' : 'col-xl-5 col-12']">
                  Broadcast:
                </label>
                <div :class="[dialer_mode ? 'col-7' : 'col-xl-7 col-12']"
                     class="d-flex align-items-center">
                  <router-link
                    :to="{ name: 'Broadcast Activity', params: { broadcast_id: communication.broadcast_id }}"
                    v-if="getBroadcast(communication.broadcast_id)">
                    <el-tooltip class="item pull-left"
                                effect="dark"
                                content="Click For More Info"
                                placement="top">
                                        <span class="text-dark-greenish">
                                            {{ getBroadcast(communication.broadcast_id).name }}
                                        </span>
                    </el-tooltip>
                  </router-link>
                  <template v-else>
                    Deleted Broadcast
                  </template>
                </div>
              </template>

              <label :class="[dialer_mode ? 'col-5' : 'col-xl-5 col-12']"
                     class="form-control-label"
                     v-if="communication.transfer_prior_user_ids">
                Transferred from:
              </label>
              <div :class="[dialer_mode ? 'col-7' : 'col-xl-7 col-12']"
                   class="d-flex align-items-center"
                   v-if="communication.transfer_prior_user_ids">
                <router-link
                  v-for="(user_id, index) in communication.transfer_prior_user_ids"
                  v-if="getUser(user_id)"
                  :key="user_id + '-user-' + index"
                  :to="{ name: 'User Activity', params: {user_id: user_id }}">
                  <el-tooltip class="item pull-left"
                              effect="dark"
                              content="Click For More Info"
                              placement="top">
                                        <span class="text-dark-greenish"
                                              :title="getUserName(getUser(user_id))">
                                            {{ getUserName(getUser(user_id)) }}
                                        </span>
                  </el-tooltip>
                </router-link>
              </div>

              <label :class="[dialer_mode ? 'col-5' : 'col-xl-5 col-12']"
                     class="form-control-label"
                     v-if="communication.transfer_target_user_ids">
                Transferred to:
              </label>
              <div :class="[dialer_mode ? 'col-7' : 'col-xl-7 col-12']"
                   class="d-flex align-items-center"
                   v-if="communication.transfer_target_user_ids">
                <router-link
                  v-for="(user_id, index) in communication.transfer_target_user_ids"
                  v-if="getUser(user_id)"
                  :key="user_id + '-user-' + index"
                  :to="{ name: 'User Activity', params: {user_id: user_id }}">
                  <el-tooltip class="item pull-left"
                              effect="dark"
                              content="Click For More Info"
                              placement="top">
                                        <span class="text-dark-greenish"
                                              :title="getUserName(getUser(user_id))">
                                            {{ getUserName(getUser(user_id)) }}
                                        </span>
                  </el-tooltip>
                </router-link>
              </div>

              <label :class="[dialer_mode ? 'col-5' : 'col-xl-5 col-12']"
                     class="form-control-label"
                     v-if="communication.transfer_target_user_ids">
                Cold transferred?
              </label>
              <div :class="[dialer_mode ? 'col-7' : 'col-xl-7 col-12']"
                   class="d-flex align-items-center"
                   v-if="communication.transfer_target_user_ids">
                                <span class="text-dark">
                                    {{ communication.in_cold_transfer | fixBooleanType }}
                                </span>
              </div>

              <template v-if="communication.metadata && communication.metadata.new_communication_id">
                <label :class="[dialer_mode ? 'col-5' : 'col-xl-5 col-12']"
                       class="form-control-label">
                  Child Call:
                </label>
                <div :class="[dialer_mode ? 'col-7' : 'col-xl-7 col-12']"
                     class="d-flex align-items-center">
                                    <span class="text-dark-greenish">
                                        <router-link :to="{ name: 'Communication', params: {communication_id: communication.metadata.new_communication_id }}">
                                            More info
                                        </router-link>
                                    </span>
                </div>
              </template>

              <template v-if="communication.metadata && communication.metadata.original_communication_id">
                <label :class="[dialer_mode ? 'col-5' : 'col-xl-5 col-12']"
                       class="form-control-label">
                  Parent Call:
                </label>
                <div :class="[dialer_mode ? 'col-7' : 'col-xl-7 col-12']"
                     class="d-flex align-items-center">
                                    <span class="text-dark-greenish">
                                        <router-link :to="{ name: 'Communication', params: {communication_id: communication.metadata.original_communication_id }}">
                                            More info
                                        </router-link>
                                    </span>
                </div>
              </template>

              <template v-if="communication.metadata && communication.metadata.active_communication_id">
                <label :class="[dialer_mode ? 'col-5' : 'col-xl-5 col-12']"
                       class="form-control-label">
                  Child Call:
                </label>
                <div :class="[dialer_mode ? 'col-7' : 'col-xl-7 col-12']"
                     class="d-flex align-items-center">
                                    <span class="text-dark-greenish">
                                        <router-link :to="{ name: 'Communication', params: {communication_id: communication.metadata.active_communication_id }}">
                                            More info
                                        </router-link>
                                    </span>
                </div>
              </template>

              <template v-if="communication.metadata && communication.metadata.fake_communication_id">
                <label :class="[dialer_mode ? 'col-5' : 'col-xl-5 col-12']"
                       class="form-control-label">
                  Parent Call:
                </label>
                <div :class="[dialer_mode ? 'col-7' : 'col-xl-7 col-12']"
                     class="d-flex align-items-center">
                                    <span class="text-dark-greenish">
                                        <router-link :to="{ name: 'Communication', params: {communication_id: communication.metadata.fake_communication_id }}">
                                            More info
                                        </router-link>
                                    </span>
                </div>
              </template>

              <label :class="[dialer_mode ? 'col-5' : 'col-xl-5 col-12']"
                     class="form-control-label"
                     v-if="communication.owner && communication.type === CommunicationTypes.SMS">
                Sent by:
              </label>
              <div :class="[dialer_mode ? 'col-7' : 'col-xl-7 col-12']"
                   class="d-flex align-items-center"
                   v-if="communication.owner && communication.type === CommunicationTypes.SMS">
                                <span class="text-dark">
                                    {{ communication.owner.name }}
                                </span>
              </div>

              <label :class="[dialer_mode ? 'col-5' : 'col-xl-5 col-12']"
                     class="form-control-label"
                     v-if="communication.type === CommunicationTypes.CALL">
                Recording:
              </label>
              <div :class="[dialer_mode ? 'col-7' : 'col-xl-7 col-12']"
                   class="d-flex align-items-center"
                   v-if="communication.type === CommunicationTypes.CALL">
                                <span class="text-dark-greenish">
                                    <communication-audio :communication="communication"
                                                         :type="UploadedFileTypes.TYPE_CALL_RECORDING"
                                                         :popover_direction="communication.direction === CommunicationDirections.INBOUND ? 'right' : 'left'">
                                    </communication-audio>
                                </span>
              </div>

              <template v-if="[CommunicationTypes.FAX, CommunicationTypes.EMAIL].includes(communication.type) && communication.attachments && communication.attachments.length > 0">
                <label :class="[dialer_mode ? 'col-5' : 'col-xl-5 col-12']"
                       class="form-control-label">
                  Files:
                </label>
                <div :class="[dialer_mode ? 'col-7' : 'col-xl-7 col-12']"
                     class="d-flex align-items-center">
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

              <label :class="[dialer_mode ? 'col-5' : 'col-xl-5 col-12']"
                     class="form-control-label"
                     v-if="[CommunicationTypes.CALL, CommunicationTypes.RVM].includes(communication.type)">
                Voicemail:
              </label>
              <div :class="[dialer_mode ? 'col-7' : 'col-xl-7 col-12']"
                   class="d-flex align-items-center"
                   v-if="[CommunicationTypes.CALL, CommunicationTypes.RVM].includes(communication.type)">
                                <span class="text-dark-greenish">
                                    <communication-audio :communication="communication"
                                                         :type="UploadedFileTypes.TYPE_CALL_VOICEMAIL">
                                    </communication-audio>
                                </span>
              </div>

              <label :class="[dialer_mode ? 'col-5' : 'col-xl-5 col-12']"
                     class="form-control-label">Notes:</label>
              <div :class="[dialer_mode ? 'col-7' : 'col-xl-7 col-12']"
                   class="d-flex flex-column justify-content-center pt-2">
                <template v-if="activity_mode || verbose">
                  <div class="w-full"
                       v-if="communication.notes">
                    {{ communication.notes }}
                  </div>
                  <div>
                    <communication-note ref="communication_notes"
                                        :small="dialer_mode"
                                        :communication="communication">
                      <template v-slot:trigger>
                        <div>
                          <i class="text-dark-greenish el-icon-document"></i>
                          <span class="text-dark-greenish _700 pointer"
                                v-if="communication.notes">Change Notes</span>
                          <span class="text-dark-greenish _700 pointer"
                                v-else>Add Notes</span>
                        </div>
                      </template>
                    </communication-note>
                  </div>
                </template>

                <communication-note ref="communication_notes"
                                    :small="dialer_mode"
                                    :communication="communication"
                                    v-else>
                  <template v-slot:trigger>
                    <div>
                      <i class="text-dark-greenish el-icon-document"></i>
                      <span class="text-dark-greenish _700 pointer"
                            v-if="communication.notes">Change Notes</span>
                      <span class="text-dark-greenish _700 pointer"
                            v-else>Add Notes</span>
                    </div>
                  </template>
                </communication-note>
              </div>

              <label :class="[dialer_mode ? 'col-5' : 'col-xl-5 col-12']"
                     class="form-control-label">Tags:</label>
              <div :class="[dialer_mode ? 'col-7' : 'col-xl-7 col-12']"
                   class="d-flex align-items-center pt-2">
                <communication-tags :communication="communication"></communication-tags>
              </div>

              <template
                v-if="communication.type === CommunicationTypes.CALL && current_company && call_dispositions.length > 0 && !dialer_mode">
                <div class="d-flex align-items-center"
                     :class="[dialer_mode ? 'col-5' : 'col-xl-5 col-12']">
                  <label class="form-control-label">Call Disposition:</label>
                  <el-popover placement="right"
                              class="ml-1"
                              width="200"
                              trigger="click"
                              v-if="current_company.force_call_disposition"
                              content="Your account admin as mandated call dispositions.">
                    <el-button type="text"
                               class="p-0"
                               slot="reference">
                      <i class="el-icon-info text-danger"></i>
                    </el-button>
                  </el-popover>
                </div>
                <div class="d-flex align-items-center pt-2"
                     :class="[dialer_mode ? 'col-7' : 'col-xl-7 col-12']">
                  <call-disposition-selector :communication="communication"></call-disposition-selector>
                </div>
              </template>
            </div>
          </div>
        </div>

        <div class="row p-l p-r"
             v-if="![CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type) && activity_mode">
          <div class="col-12">
            <router-link
              :to="{ name: 'Communication', params: {communication_id: communication.id}}">
              <button class="btn btn-sm greyish text-left">
                <i class="material-icons mr-2">info</i>
                More Details
              </button>
            </router-link>
          </div>
        </div>
        <div class="row p-l p-r"
             v-if="[CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)">
          <div class="col-12 text-center">
            <div class="text-center pb-3 b-b">
              <el-radio-group v-model="communication.disposition_status2"
                              :disabled="loading_update_engagement"
                              @change="changeEngagementStatus">
                <template v-if="communication.type == CommunicationTypes.APPOINTMENT">
                  <el-radio-button :label="CommunicationDispositionStatus.DISPOSITION_STATUS_APPOINTMENT_SET">
                    Set
                  </el-radio-button>
                  <el-radio-button :label="CommunicationDispositionStatus.DISPOSITION_STATUS_APPOINTMENT_SHOWN">
                    Shown
                  </el-radio-button>
                  <el-radio-button :label="CommunicationDispositionStatus.DISPOSITION_STATUS_APPOINTMENT_CANCELED">
                    Canceled
                  </el-radio-button>
                </template>
                <template v-else>
                  <el-radio-button :label="CommunicationDispositionStatus.DISPOSITION_STATUS_PLACED_NEW">
                    Pending
                  </el-radio-button>
                  <el-radio-button :label="CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED_NEW">
                    Completed
                  </el-radio-button>
                  <el-radio-button :label="CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW">
                    Canceled
                  </el-radio-button>
                </template>
              </el-radio-group>
            </div>
            <div class="text-center pt-3">
              <router-link
                :to="{ name: 'Calendar', query: { communication_id: communication.id, view: 'month' }}">
                <el-button size="">
                  <i class="fa fa-calendar mr-1"></i>
                  Open in Calendar
                </el-button>
              </router-link>
            </div>
            <sms-reminders :communication_id="communication.id"
                           :campaign_id="campaign_id"
                           :appointment_datetime="communication.engagement_data.appointment_datetime">
            </sms-reminders>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
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
import auth from '../../../../boot/auth'
import {
  acl_mixin,
  avatar_mixin,
  communication_info_mixin,
  user_info_mixin
} from '../mixins'
import {mapState} from 'vuex'
import VueLoadImage from 'vue-load-image'
import * as AnswerTypes from '../constants/answer-types'
import * as CommunicationCurrentStatus from '../constants/communication-current-status'
import * as CommunicationDispositionStatus from '../constants/communication-disposition-status'
import * as CommunicationTypes from '../constants/communication-types'
import * as CommunicationDirections from '../constants/communication-direction'
import * as UploadedFileTypes from '../constants/uploaded-file-types'
import ContactDispositionSelector from "./contact-disposition-selector"
import SmsReminders from '../components/sms-reminders'
import TargetUsersTree from "./target-users-tree";

export default {
  name: 'communication-info',
  mixins: [
    acl_mixin,
    avatar_mixin,
    communication_info_mixin,
    user_info_mixin
  ],

  components: {
    TargetUsersTree,
    ContactDispositionSelector,
    SmsReminders,
    'vue-load-image': VueLoadImage
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

    display_contact: {
      required: false,
      default: false,
      type: Boolean
    },

    activity_mode: {
      required: false,
      default: false,
      type: Boolean
    },

    dialer_mode: {
      required: false,
      default: false,
      type: Boolean
    },

    hide_contact_disposition: {
      required: false,
      default: false,
      type: Boolean
    },

    is_widget: {
      required: false,
      default: false,
      type: Boolean
    },

    campaign_id: {
      required: false
    },
  },

  data() {
    return {
      auth: auth,
      loading_dispose: false,
      REJECTION_REASON_CREDITS: 1, // A call/SMS was received by our system but not shown to user because company was out of credit
      REJECTION_REASON_BLOCKED: 2, // A call/SMS was received by our system but was blocked because caller's phone number is blocked.
      REJECTION_REASON_OTHER: 3, // A call/SMS was received by our system but was blocked because because of other reasons, e.g.: .
      REJECTION_REASON_USER_NOT_FOUND: 4, // A call/SMS was received by our system but it doesn't have a user
      REJECTION_REASON_FAILED: 5, // A call/SMS was failed
      activeName: '',
      loading_update_engagement: false,
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      AnswerTypes,
      CommunicationDirections,
      CommunicationCurrentStatus,
      CommunicationDispositionStatus,
      CommunicationTypes,
      UploadedFileTypes,
    }
  },

  created() {
    if (!this.activity_mode) {
      this.activeName = 'main'
    }
    // Default to Expand/Open this component collapse component if comm type is appointment, reminder or note
    if (this.communication && [CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER, CommunicationTypes.NOTE].includes(this.communication.type)) {
      this.activeName = 'main'
    }
  },

  computed: {
    ...mapState(['campaigns', 'workflows', 'broadcasts', 'disposition_statuses', 'call_dispositions', 'ring_groups']),
    ...mapState('cache', ['current_company'])
  },

  methods: {
    getCampaign(id) {
      if (!id) {
        return null
      }
      let found = this.campaigns.find(campaign => campaign.id === id)
      if (found) {
        return found
      }

      return null
    },

    getRingGroup(id) {
      if (!id) {
        return null
      }
      let found = this.ring_groups.find(ring_group => ring_group.id === id)
      if (found) {
        return found
      }

      return null
    },

    getWorkflow(id) {
      if (!id) {
        return null
      }
      let found = this.workflows.find(workflow => workflow.id === id)
      if (found) {
        return found
      }

      return null
    },

    getBroadcast(id) {
      if (!id) {
        return null
      }
      let found = this.broadcasts.find(broadcast => broadcast.id === id)
      if (found) {
        return found
      }

      return null
    },

    dispose(disposition_status) {
      this.loading_dispose = true
      axios.post('/api/v1/contact/' + this.communication.contact_id + '/dispose', {disposition_status}).then((res) => {
        this.loading_dispose = false
        this.$notify({
          offset: 95,
          title: 'Contact',
          message: 'Contact disposed',
          type: 'success',
          showClose: true,
        })
        this.communication.contact.disposition_status_id = res.data.disposition_status_id
      }).catch((err) => {
        this.loading_dispose = false
        this.$root.handleErrors(err.response)
      })
    },

    changeEngagementStatus(status) {
      const params = {
        status: status
      }

      this.loading_update_engagement = true
      axios.post(`/api/v1/contact/${this.communication.contact_id}/${this.communication.id}/update-engagement`, params).then(res => {
        this.loading_update_engagement = false
        this.$notify({
          offset: 95,
          title: 'Contact',
          message: 'Engagement updated.',
          type: 'success',
          showClose: true
        })
        this.$emit('update', res.data)
      }).catch(err => {
        this.loading_update_engagement = false
        this.$root.handleErrors(err.response)
      })
    },

    callDisposed(call_disposition_id) {
      if (typeof call_disposition_id !== 'undefined') {
        this.communication.call_disposition_id = call_disposition_id
      }
      this.$emit('callDisposed')
    },

    contactDisposed(disposition_status_id) {
      if (typeof disposition_status_id !== 'undefined') {
        this.communication.contact.disposition_status_id = disposition_status_id
      }
      if (this.communication.contact.disposition_status_id) {
        this.$emit('contactDisposed')
      } else {
        this.$emit('contactNotDisposed')
      }
    },
  }
}
</script>
