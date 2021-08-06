<template>
  <div :class="[ isVisible ? '' : 'invisible' ]"
       class="phone d-flex flex-column"
       ref="phone"
       v-if="shouldShow">
    <div class="phone-header d-flex grabbable d-flex justify-content-between align-items-center"
         ref="phoneHeader">
      <div class="d-flex flex-row text-size-rg _500 text-white width-65">
        <span v-if="dialer.timer">{{ dialer.timer }}</span>
        <span v-else-if="isCallCompleted"></span>
        <span v-else>
          0:00
        </span>
      </div>
      <div class="d-flex flex-row text-xs text-white">
        <span v-if="isCallCompleted">Call Ended</span>
        <span v-else-if="getCampaign(dialer.communication.campaign_id)">{{ getCampaign(dialer.communication.campaign_id).name | truncate(15) }}</span>
      </div>
      <div class="d-flex flex-row justify-content-end align-items-center width-65">
        <pause-record-icon width="14"
                           height="14"
                           class="mr-2"
                           v-show="(!isCallCompleted || devMode) && dialer.recordingStatus === 'in-progress' && dialer.communication && dialer.communication.should_record === true">
        </pause-record-icon>

        <ul id="signal-strength"
            class="mr-2"
            v-if="!isCallCompleted">
          <li class="very-weak">
            <div id="very-weak"
                 class="active">
            </div>
          </li>
          <li class="weak">
            <div id="weak"
                 :class="[ signalStrength >= 25 ? 'active' : '' ]">
            </div>
          </li>
          <li class="strong">
            <div id="strong"
                 :class="[ signalStrength >= 50 ? 'active' : '' ]">
            </div>
          </li>
          <li class="pretty-strong">
            <div id="pretty-strong"
                 :class="[ signalStrength >= 75 ? 'active' : '' ]">
            </div>
          </li>
        </ul>

        <q-btn-dropdown :ripple="false"
                        :menu-offset="[29, 8]"
                        class="tab-dropdown no-arrow mr-2"
                        ref="menu"
                        flat>
          <template v-slot:label>
            <q-btn icon="img:app-icons/dialer/phone_settings.svg"
                   size="12px"
                   class="icon-btn auto-size height-12"
                   padding="none"
                   flat>
            </q-btn>
          </template>

          <div class="phone-settings">
            <q-item-label class="mb-1">Input device</q-item-label>
            <q-select :options="inputDevices"
                      v-model="inputDevice"
                      class="has-margin-top-5"
                      option-value="id"
                      option-label="label"
                      use-input
                      emit-value
                      map-options
                      outlined
                      dense
                      @input="setInputDevice">
            </q-select>

            <q-item-label class="mt-3 mb-1">Output device</q-item-label>
            <q-select :options="outputDevices"
                      v-model="outputDevice"
                      class="has-margin-top-5"
                      option-value="id"
                      option-label="label"
                      use-input
                      emit-value
                      map-options
                      outlined
                      dense
                      @input="setOutputDevice">
            </q-select>

            <q-btn color="primary"
                   class="full-width border-half-rounded mt-2 text-size-sm q-pa-xs"
                   label="Speaker Test"
                   no-caps
                   unelevated
                   dense
                   @click="testOutputDevice">
            </q-btn>

            <button class="btn text-size-sm _400 text-grey-100 p-0 mt-2 d-flex align-items-center"
                    @click="forceRefreshCommunication">
              <i class="material-icons">refresh</i>
              <span class="ml-2">Refresh</span>
            </button>
          </div>
        </q-btn-dropdown>

        <q-btn icon="img:app-icons/dialer/phone_exit.svg"
               size="12px"
               class="icon-btn auto-size height-12"
               padding="none"
               flat
               @click="closePhone">
        </q-btn>
      </div>
    </div>
    <div class="phone-body d-flex flex-column flex-grow-1 align-items-center justify-content-around">
      <template v-if="screen === 'call'">
        <div class="phone-notice d-flex flex-column align-items-center"
             v-if="dialer.contact && dialer.call && dialer.call.direction === 'OUTGOING' && showLocalTime">
          <q-banner class="bg-primary text-white pt-1 pb-1"
                    inline-actions
                    rounded
                    dense>
            <template v-slot:avatar>
              <q-icon name="o_info"
                      color="white"
                      class="text-size-rg">
              </q-icon>
            </template>
            <span class="text-size-xs">It's {{ currentLocalTime }} in the timezone of the person you are calling</span>
            <template v-slot:action>
              <q-btn color="white"
                     icon="o_cancel"
                     class="text-size-rg"
                     padding="none"
                     flat
                     round
                     @click="hideLocalTime">
              </q-btn>
            </template>
          </q-banner>
        </div>
        <div class="phone-info d-flex flex-column align-items-center">
          <person-icon></person-icon>

          <div class="text-white text-center">
            <q-item-label class="text-size-xxl _600 mt-2 d-flex align-items-center justify-content-center"
                          v-if="dialer.contact">
              <span class="d-inline-flex">{{ contactName | truncate(15) }}</span>
              <q-btn color="white"
                     icon="o_info"
                     class="text-size-rg d-inline-flex ml-1"
                     flat
                     round
                     @click="goToContact">
              </q-btn>
            </q-item-label>
            <q-item-label class="text-size-sm _400 mt-1 d-flex align-items-center justify-content-center">
              <span class="d-inline-flex">{{ dialer.communication.lead_number | fixPhone }}</span>
              <b-link href="#"
                      class="copy-phone-number text-white d-inline-flex ml-1"
                      @click.prevent="copyPhoneNumber">
                <i class="material-icons">content_copy</i>
              </b-link>
              <input :value="dialer.communication.lead_number"
                     type="hidden"
                     id="phone-number-clone"/>
            </q-item-label>
            <q-item-label class="text-size-sm _400 mt-1"
                          v-if="dialer.contact && dialer.contact.company_name">
              {{ dialer.contact.company_name }}
            </q-item-label>
          </div>
        </div>
        <div class="phone-status d-flex justify-content-center"
             v-if="phoneStatus">
          <span>{{ phoneStatus }}</span>
        </div>
        <div class="phone-cta">
          <div class="d-flex flex-row justify-content-between"
               v-if="dialer.call && dialer.call.direction === 'INCOMING'">
            <div class="d-flex flex-column align-items-center">
              <q-btn class="height-52"
                     ripple
                     round
                     no-caps
                     @click="rejectCall">
                <cancel-call-icon width="52"
                                  height="52">
                </cancel-call-icon>
              </q-btn>
              <span class="text-size-xs mt-1">Decline</span>
            </div>

            <div class="d-flex flex-column align-items-center">
              <q-btn class="height-52"
                     ripple
                     round
                     no-caps
                     @click="answerCall">
                <accept-call-icon width="52"
                                  height="52">
                </accept-call-icon>
              </q-btn>
              <span class="text-size-xs mt-1">Accept</span>
            </div>
          </div>

          <div class="d-flex flex-column justify-content-center align-items-center"
               v-if="dialer.call && dialer.call.direction === 'OUTGOING'">
            <q-btn :disable="dialer.currentStatus === 'MAKING_CALL'"
                   :class="[ dialer.communication.current_status2 !== CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW ? 'ripple' : '']"
                   class="height-52"
                   round
                   no-caps
                   @click="hangupCall">
              <cancel-call-icon width="52"
                                height="52">
              </cancel-call-icon>
            </q-btn>
            <span class="text-size-xs mt-1">Hang Up</span>
          </div>
        </div>
      </template>
      <template v-else-if="screen === 'menu'">
        <div class="phone-main d-flex flex-column align-items-center">
          <div class="dummy bg-dark w-100 height-36"></div>
          <div class="phone-avatar">
            <avatar :name="contactName"
                    class="contact-avatar text-size-xxxl"
                    width="50"
                    height="50">
            </avatar>
          </div>
          <div class="phone-info small d-flex flex-column align-items-center">
            <div class="text-grey-100 text-center">
              <q-item-label class="text-size-xxl _600 mt-2 d-flex align-items-center justify-content-center"
                            v-if="dialer.contact">
                <span class="d-inline-flex">{{ contactName | truncate(15) }}</span>
                <q-btn color="text-grey-100"
                       icon="o_info"
                       class="text-size-rg d-inline-flex ml-1"
                       flat
                       round
                       @click="goToContact">
                </q-btn>
              </q-item-label>
              <q-item-label class="text-size-sm _400 mt-1 d-flex align-items-center justify-content-center">
                <span class="d-inline-flex">{{ dialer.communication.lead_number | fixPhone }}</span>
                <b-link href="#"
                        class="copy-phone-number text-grey-100 d-inline-flex ml-1"
                        @click.prevent="copyPhoneNumber">
                  <i class="material-icons">content_copy</i>
                </b-link>
                <input :value="dialer.communication.lead_number"
                       type="hidden"
                       id="phone-number-clone"/>
              </q-item-label>
              <q-item-label class="text-size-sm text-grey-90 _400 mt-1"
                            v-if="dialer.contact && dialer.contact.company_name">
                <span>{{ dialer.contact.company_name }}</span>
                <span class="ml-1 mr-1"
                      v-if="currentLocalTime">
                  ·
                </span>
                <span v-if="currentLocalTime">{{ currentLocalTime }}</span>
              </q-item-label>
            </div>
          </div>
          <div class="d-flex justify-content-between w-100 mt-3 pl-3 pr-3">
            <button :disabled="isMuteDisabled"
                    class="phone-buttons btn"
                    @click="toggleMute">
              <mute-icon width="16"
                         height="16"
                         v-show="!dialer.isMuted">
              </mute-icon>
              <unmute-icon width="16"
                           height="16"
                           v-show="dialer.isMuted">
              </unmute-icon>
              <span>{{ dialer.isMuted ? 'Unmute' : 'Mute' }}</span>
            </button>
            <button :disabled="isHoldDisabled || loadingHold || loadingUnhold"
                    class="phone-buttons btn"
                    @click="toggleHold">
              <hold-icon width="16"
                         height="16"
                         v-show="!dialer.isHeld">
              </hold-icon>
              <unhold-icon width="16"
                           height="16"
                           v-show="dialer.isHeld">
              </unhold-icon>
              <span>{{ dialer.isHeld ? 'Unhold' : 'Hold' }}</span>
            </button>
            <button class="phone-buttons btn"
                    @click="openDialpad">
              <dialpad-icon width="16"
                            height="16">
              </dialpad-icon>
              <span>Dial pad</span>
            </button>
            <button :disabled="isRecordingDisabled || loadingToggleRecordingStatus || dialer.communication.should_record === false"
                    class="phone-buttons btn"
                    @click="toggleRecordingStatus">
              <record-icon width="16"
                           height="16"
                           v-show="dialer.recordingStatus === 'paused' && dialer.communication.should_record === true">
              </record-icon>
              <pause-record-icon width="16"
                                 height="16"
                                 v-show="dialer.recordingStatus === 'in-progress' && dialer.communication.should_record === true">
              </pause-record-icon>
              <span>{{ recordingText }}</span>
            </button>
          </div>
          <div class="d-flex justify-content-between w-100 mt-3 pl-3 pr-3">
            <button class="phone-buttons elevated btn"
                    @click="openNotes">
              <notes-icon width="16"
                          height="16">
              </notes-icon>
              <span>Notes</span>
            </button>
            <button class="phone-buttons elevated btn"
                    @click="openTags">
              <tags-icon width="16"
                         height="16">
              </tags-icon>
              <span>Tags</span>
            </button>
            <button :disabled="isVmDropDisabled"
                    class="phone-buttons elevated btn"
                    @click="openVmDrop">
              <vm-drop-icon width="18"
                            height="18">
              </vm-drop-icon>
              <span>VM Drop</span>
            </button>
          </div>
          <div class="d-flex justify-content-between w-100 mt-5 pl-3 pr-3">
            <button :disabled="isHangupDisabled"
                    class="phone-buttons btn"
                    @click="endCall">
              <cancel-call-icon width="40"
                                height="40">
              </cancel-call-icon>
            </button>
            <button :disabled="isAddDisabled"
                    class="phone-buttons btn"
                    @click="openAdd">
              <add-icon width="16"
                        height="16">
              </add-icon>
              <span>Add</span>
            </button>
            <button :disabled="isTransferDisabled"
                    class="phone-buttons btn"
                    @click="openTransfer">
              <transfer-icon width="16"
                             height="16">
              </transfer-icon>
              <span>Transfer</span>
            </button>
            <button :disabled="isMoreDisabled"
                    class="phone-buttons btn"
                    @click="openMore">
              <more-icon width="16"
                         height="16">
              </more-icon>
              <span>More</span>
            </button>
          </div>
        </div>
      </template>
      <template v-else-if="screen === 'wrap-up'">
        <div class="phone-wrap-up d-flex flex-column pl-2 pr-2 flex-grow-1 overflow-auto">
          <b-list-group class="w-100 border-bottom">
            <b-list-group-item class="d-flex align-items-center border-0 pl-0 pr-0">
              <avatar class="contact-avatar"
                      width="40"
                      height="40"
                      :name="dialer.contact.name">
              </avatar>
              <div class="ml-2 flex-grow-1 d-inline-flex justify-content-between contact-details">
                <div class="mr-auto">
                  <p class="contact-name mb-1">
                    <span class="d-inline-flex">{{ contactName | truncate(15) }}</span>
                    <q-btn color="black"
                           icon="o_info"
                           class="text-size-rg d-inline-flex ml-1"
                           flat
                           round
                           @click="goToContact">
                    </q-btn>
                  </p>
                  <p class="text-sm-left contact-phone mb-1">
                    <span>{{ dialer.contact.phone_number | fixPhone }}</span>
                    <b-link href="#"
                            class="copy-phone-number text-grey-100 d-inline-flex ml-1"
                            @click.prevent="copyPhoneNumber">
                      <i class="material-icons">content_copy</i>
                    </b-link>
                    <input :value="dialer.contact.phone_number"
                           type="hidden"
                           id="phone-number-clone"/>
                  </p>
                </div>
              </div>
            </b-list-group-item>
          </b-list-group>

          <q-item-section class="d-flex flex-row border-bottom justify-content-start flex-grow-0 pt-2 pb-2">
            <div class="pr-2">
              <component :is="stateToIcon(dialer.communication.disposition_status2, dialer.communication.type, dialer.communication.direction)"
                         v-if="dialer.communication.disposition_status2">
              </component>
            </div>
            <div class="text-lt p-x"
                 :class="[!dialer.communication.duration ? 'flex-grow-1 text-left' : '']">
              <span v-if="![CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(dialer.communication.type)">
                {{ dialer.communication.direction | fixCommDirection }}
              </span>
              {{ dialer.communication.type | fixCommType }}
            </div>
          </q-item-section>

          <div class="d-flex flex-column pt-2 pb-2 w-100 border-bottom">
            <label class="form-control-label text-grey-90">
              Call Disposition
            </label>
            <div class="d-flex flex-row align-items-center w-100">
              <call-disposition-wrapper :communication="dialer.communication"
                                        class="w-100">
              </call-disposition-wrapper>
            </div>
          </div>

          <div class="d-flex flex-column pt-2 pb-2 w-100 border-bottom">
            <label class="form-control-label text-grey-90">
              Contact Disposition
            </label>
            <div class="d-flex flex-row align-items-center w-100">
              <contact-disposition-wrapper :contact="dialer.contact"
                                           class="w-100">
              </contact-disposition-wrapper>
            </div>
          </div>

          <div class="d-flex flex-column pt-2 pb-2 w-100 border-bottom">
            <label class="form-control-label text-grey-90">
              Send Message
            </label>
            <div class="d-flex flex-row align-items-center w-100">
              <div class="d-flex flex-grow-1">
                <template-selector class="w-100"
                                   v-model="templateId"
                                   @change="changeTemplate">
                </template-selector>
              </div>
              <div class="d-flex flex-shrink-0 ml-2">
                <b-button :loading="loadingSendMessage"
                          :disabled="loadingSendMessage || !template"
                          variant="primary"
                          size="sm"
                          @click="sendMessage">
                  <span>Send</span>
                </b-button>
              </div>
            </div>
          </div>

          <div class="d-flex flex-column pt-2 pb-2 w-100 border-bottom">
            <div class="d-flex flex-row align-items-center w-100 mb-2">
              <label class="form-control-label mb-0 text-grey-90">Started at:</label>
              <span class="ml-2">{{ dialer.communication.created_at | fixCommunicationDateTime }}</span>
            </div>
            <div class="d-flex flex-row align-items-center w-100">
              <label class="form-control-label mb-0 text-grey-90">Duration:</label>
              <span class="ml-2">{{ dialer.communication.duration | fixDuration }}</span>
            </div>
          </div>

          <div class="d-flex align-items-center pt-2 pb-2 w-100 border-bottom">
            <label class="form-control-label mb-0 text-grey-90">Line:</label>
            <span class="ml-2"
                  v-if="getCampaign(dialer.communication.campaign_id)">
              {{ getCampaign(dialer.communication.campaign_id).name }}
            </span>
          </div>

          <div class="d-flex flex-column pt-2 pb-2 w-100 border-bottom">
            <label class="form-control-label text-grey-90"
                   v-if="dialer.communication.has_recording">
              Call Recording
            </label>
            <div class="d-flex align-items-center w-100"
                 v-if="dialer.communication.has_recording">
              <communication-audio :communication="dialer.communication"
                                   :type="UploadedFileTypes.TYPE_CALL_RECORDING"
                                   :uniqueId="dialer.communication.id + '1'">
              </communication-audio>
            </div>
            <div class="form-control-label text-grey-90 w-100"
                 v-else>
              No Call Recording
            </div>
          </div>

          <div class="d-flex flex-column pt-2 pb-2 w-100 border-bottom">
            <label class="form-control-label text-grey-90"
                   v-if="dialer.communication.has_voicemail">
              Voicemail
            </label>
            <div class="d-flex flex-row align-items-center w-100"
                 v-if="dialer.communication.has_voicemail">
              <communication-audio :communication="dialer.communication"
                                   :type="UploadedFileTypes.TYPE_CALL_VOICEMAIL"
                                   :uniqueId="dialer.communication.id + '2'">
              </communication-audio>
            </div>
            <div class="form-control-label text-grey-90 w-100"
                 v-else>
              No Voicemail
            </div>
          </div>

          <div class="d-flex flex-column pt-2 pb-2 w-100 border-bottom">
            <label class="form-control-label text-grey-90">Tags</label>
            <div class="d-flex align-items-center w-100">
              <communication-tags :communication="dialer.communication"/>
            </div>
          </div>

          <div class="d-flex flex-column pt-2 pb-2 w-100 border-bottom">
            <label class="form-control-label text-grey-90">Notes</label>
            <div class="d-flex align-items-center w-100">
              <communication-note ref="communication_notes"
                                  :communication="dialer.communication">
              </communication-note>
            </div>
          </div>

        </div>
      </template>
    </div>
    <div class="phone-footer-buttons p-2"
         v-if="isCallCompleted && !devMode">
      <b-button variant="outline-dark"
                @click="makeCall">
        <b-icon icon="telephone-fill" aria-hidden="true"></b-icon>
        <span class="ml-1">Call Back</span>
      </b-button>

      <b-button variant="primary"
                @click="endWrapUp">
        <span>Finish</span>
        <span v-if="dialer.wrapUpTimer"> ({{ dialer.wrapUpTimer }}s)</span>
      </b-button>
    </div>
    <div class="phone-expansion d-flex overlay"
         v-if="(devMode || !isCallCompleted) && dialer.contact && expansionEnabled">
      <q-expansion-item v-model="expanded"
                        class="shadow-1 overflow-hidden w-100"
                        header-class="text-sm bg-white text-center"
                        expand-icon-class="text-grey-100"
                        switch-toggle-side
                        dense>
        <template v-slot:header>
          <q-item-section>
            <q-item-label>{{ bottomExpansionLabel }}</q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-btn :ripple="false"
                   :class="[ !expanded ? 'invisible' : '']"
                   color="primary"
                   label="Cancel"
                   class="no-q-btn-focus"
                   no-caps
                   unelevated
                   dense
                   flat
                   @click="saveAndResetExpansion">
            </q-btn>
          </q-item-section>
        </template>

        <q-card>
          <template v-if="bottomExpansion === 'integrations'">
            <q-card-section class="height-240">
              <contact-integrations :contact="dialer.contact"
                                    :no_title="true"
                                    v-show="expanded">
              </contact-integrations>
            </q-card-section>
          </template>
          <template v-if="bottomExpansion === 'dialpad'">
            <q-card-section class="height-445">
              <div class="d-flex flex-column justify-content-around h-100 pt-3 pb-3">
                <div class="d-flex flex-column">
                  <b-form-input v-model="digits"
                                class="phone-digits"
                                type="text">
                  </b-form-input>
                </div>
                <div class="d-flex flex-column dialpad">
                  <div class="d-flex flex-row align-items-center justify-content-between mb-2">
                    <button class="number-btn-wrapper btn"
                            @click="sendDigit('1')">
                      <span class="number-text">1</span>
                      <span class="number-text-sub invisible">$</span>
                    </button>

                    <button class="number-btn-wrapper btn"
                            @click="sendDigit('2')">
                      <span class="number-text">2</span>
                      <span class="number-text-sub">A B C</span>
                    </button>

                    <button class="number-btn-wrapper btn"
                            @click="sendDigit('3')">
                      <span class="number-text">3</span>
                      <span class="number-text-sub">D E F</span>
                    </button>
                  </div>
                  <div class="d-flex flex-row align-items-center justify-content-between mb-2">
                    <button class="number-btn-wrapper btn"
                            @click="sendDigit('4')">
                      <span class="number-text">4</span>
                      <span class="number-text-sub">G H I</span>
                    </button>

                    <button class="number-btn-wrapper btn"
                            @click="sendDigit('5')">
                      <span class="number-text">5</span>
                      <span class="number-text-sub">J K L</span>
                    </button>

                    <button class="number-btn-wrapper btn"
                            @click="sendDigit('6')">
                      <span class="number-text">6</span>
                      <span class="number-text-sub">M N O</span>
                    </button>
                  </div>
                  <div class="d-flex flex-row align-items-center justify-content-between mb-2">
                    <button class="number-btn-wrapper btn"
                            @click="sendDigit('7')">
                      <span class="number-text">7</span>
                      <span class="number-text-sub">P Q R S</span>
                    </button>

                    <button class="number-btn-wrapper btn"
                            @click="sendDigit('8')">
                      <span class="number-text">8</span>
                      <span class="number-text-sub">T U V</span>
                    </button>

                    <button class="number-btn-wrapper btn"
                            @click="sendDigit('9')">
                      <span class="number-text">9</span>
                      <span class="number-text-sub">W X Y Z</span>
                    </button>
                  </div>
                  <div class="d-flex flex-row align-items-center justify-content-between">
                    <button class="number-btn-wrapper btn"
                            @click="sendDigit('*')">
                      <span class="number-text">*</span>
                      <span class="number-text-sub invisible">$</span>
                    </button>

                    <button class="number-btn-wrapper btn"
                            v-longpress="handleLongPress">
                      <span class="number-text">0</span>
                      <span class="number-text-sub">+</span>
                    </button>

                    <button class="number-btn-wrapper btn"
                            @click="sendDigit('#')">
                      <span class="number-text">#</span>
                      <span class="number-text-sub invisible">$</span>
                    </button>
                  </div>
                </div>
                <div class="d-flex flex-column align-items-center">
                  <q-btn class="height-56"
                         ripple
                         round
                         no-caps
                         unelevated
                         @click="endCall">
                    <cancel-call-icon width="56"
                                      height="56">
                    </cancel-call-icon>
                  </q-btn>
                </div>
              </div>
            </q-card-section>
          </template>
          <template v-if="bottomExpansion === 'notes'">
            <q-card-section class="height-445">
              <contact-notes :contact="dialer.contact"
                             :no_title="true"
                             @update="onNotesUpdate">
              </contact-notes>
            </q-card-section>
          </template>
          <template v-if="bottomExpansion === 'tags'">
            <q-card-section class="height-240">
              <contact-tags :contact="dialer.contact"
                            :no_title="true"
                            @update="onTagsUpdate">
              </contact-tags>
            </q-card-section>
          </template>
          <template v-if="bottomExpansion === 'scripts'">
            <q-card-section class="height-445 overflow-hidden-y">
              <div class="d-flex flex-column justify-content-start w-100 pt-3 pl-3 pr-3">
                <script-selector :communication="dialer.communication"
                                 v-model="scriptId"
                                 class="w-100"
                                 @change="changeScript">
                </script-selector>
              </div>
              <div class="d-flex flex-column justify-content-start w-100 mt-2 pl-3 pr-3 height-410 overflow-auto"
                   v-if="script"
                   v-html="script.text">
              </div>
            </q-card-section>
          </template>
          <template v-if="bottomExpansion === 'add'">
            <q-card-section class="height-445">
            </q-card-section>
          </template>
          <template v-if="bottomExpansion === 'transfer'">
            <q-card-section class="height-445">
              <div class="d-flex flex-column justify-content-between w-100 pt-3 pb-3 pl-3 pr-3 h-100">
                <div class="d-flex w-100">
                  <q-list class="phone-radio-select w-100">
                    <q-item tag="label"
                            class="pl-0 pr-0"
                            dense>
                      <q-item-section avatar>
                        <q-radio v-model="transfer.mode"
                                 val="user"
                                 color="primary"
                                 size="xs"
                                 dense>
                        </q-radio>
                      </q-item-section>
                      <q-item-section>
                        <template v-if="transfer.mode === 'user'">
                          <div class="d-inline-flex w-100">
                            <available-user-selector :communication="dialer.communication"
                                                     v-model="transfer.userId"
                                                     ref="availableUserSelector"
                                                     class="flex-grow-1"
                                                     @change="changeTransferUser">
                            </available-user-selector>

                            <q-btn color="black"
                                   icon="refresh"
                                   class="text-size-xxs ml-1"
                                   flat
                                   round
                                   @click="getUsers">
                            </q-btn>
                          </div>
                        </template>
                        <template v-else>
                          <span class="text-rg text-grey-100">Transfer to User</span>
                        </template>
                      </q-item-section>
                    </q-item>
                    <q-item tag="label"
                            class="pl-0 pr-0"
                            dense>
                      <q-item-section avatar>
                        <q-radio v-model="transfer.mode"
                                 val="ring-group"
                                 color="primary"
                                 size="xs"
                                 dense>
                        </q-radio>
                      </q-item-section>
                      <q-item-section>
                        <template v-if="transfer.mode === 'ring-group'">
                          <ring-group-selector v-model="transfer.ringGroupId"
                                               @change="changeTransferRingGroup">
                          </ring-group-selector>
                        </template>
                        <template v-else>
                          <span class="text-rg text-grey-100">Transfer to Ring Group</span>
                        </template>
                      </q-item-section>
                    </q-item>
                    <q-item tag="label"
                            class="pl-0 pr-0"
                            dense>
                      <q-item-section avatar>
                        <q-radio v-model="transfer.mode"
                                 val="phone-number"
                                 color="primary"
                                 size="xs"
                                 dense>
                        </q-radio>
                      </q-item-section>
                      <q-item-section>
                        <template v-if="transfer.mode === 'phone-number'">
                          <q-input v-model="transfer.phoneNumber"
                                   class="form-control-search form-control"
                                   placeholder="Enter phone number"
                                   borderless
                                   clearable
                                   dense
                                   @input="changeTransferPhoneNumber">
                          </q-input>
                        </template>
                        <template v-else>
                          <span class="text-rg text-grey-100">Transfer to Phone Number</span>
                        </template>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
                <div class="d-flex">
                  <b-button :loading="loadingTransfer"
                            :disabled="loadingTransfer || !transferValidated"
                            variant="primary"
                            size="sm"
                            block
                            @click="transferCall">
                    <span>Transfer</span>
                  </b-button>
                </div>
              </div>
            </q-card-section>
          </template>
          <template v-if="bottomExpansion === 'vm-drop'">
            <q-card-section class="height-445">
              <div class="d-flex flex-column justify-content-between w-100 pt-3 pb-3 pl-3 pr-3 h-100">
                <div class="d-flex">
                  <vm-drop-selector v-model="vmDropId"
                                    class="w-100"
                                    @change="changeVmDrop">
                  </vm-drop-selector>
                </div>
                <div class="d-flex">
                  <b-button :loading="loadingSendVmDrop"
                            :disabled="loadingSendVmDrop || !vmDropId"
                            variant="primary"
                            size="sm"
                            block
                            @click="sendVmDrop">
                    <span>Leave Voicemail</span>
                  </b-button>
                </div>
              </div>
            </q-card-section>
          </template>
          <template v-if="bottomExpansion === 'more'">
            <q-card-section class="height-140">
              <div class="d-flex justify-content-start w-100 pt-3 pl-3 pr-3">
                <button class="phone-buttons btn"
                        @click="openScripts">
                  <scripts-icon width="18"
                                height="18">
                  </scripts-icon>
                  <span>Scripts</span>
                </button>
                <button :disabled="isParkDisabled"
                        class="phone-buttons btn"
                        @click="parkCall">
                  <park-call-icon width="18"
                                  height="18">
                  </park-call-icon>
                  <span>Park Call</span>
                </button>
                <button class="phone-buttons btn"
                        @click="openContact">
                  <contact-icon width="18"
                                height="18">
                  </contact-icon>
                  <span>Contact</span>
                </button>
                <button class="phone-buttons btn"
                        @click="openIntegrations">
                  <integrations-icon width="18"
                                     height="18">
                  </integrations-icon>
                  <span>Integrations</span>
                </button>
              </div>
            </q-card-section>
          </template>
        </q-card>
      </q-expansion-item>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { communicationInfoMixin } from 'src/plugins/mixins'
import CancelCallIcon from 'components/icons/cancel-call-icon'
import AcceptCallIcon from 'components/icons/accept-call-icon'
import PersonIcon from 'components/icons/person-icon'
import Avatar from 'components/avatar'
import RecordIcon from 'components/icons/record-icon'
import DialpadIcon from 'components/icons/dialpad-icon'
import HoldIcon from 'components/icons/hold-icon'
import MuteIcon from 'components/icons/mute-icon'
import NotesIcon from 'components/icons/notes-icon'
import TagsIcon from 'components/icons/tags-icon'
import ScriptsIcon from 'components/icons/scripts-icon'
import ContactIntegrations from 'components/contacts/contact-integrations'
import AddIcon from 'components/icons/add-icon'
import MoreIcon from 'components/icons/more-icon'
import TransferIcon from 'components/icons/transfer-icon'
import UnholdIcon from 'components/icons/unhold-icon'
import UnmuteIcon from 'components/icons/unmute-icon'
import PauseRecordIcon from 'components/icons/pause-record-icon'
import ContactNotes from 'components/contacts/contact-notes'
import ContactTags from 'components/contacts/contact-tags'
import IntegrationsIcon from 'components/icons/integrations-icon'
import VmDropIcon from 'components/icons/vm-drop-icon'
import CommunicationAudio from 'components/communication-audio'
import CommunicationNote from 'components/communication-note'
import CommunicationTags from 'components/communication-tags'
import CallDispositionWrapper from 'components/generic-wrappers/call-disposition-wrapper'
import ContactDispositionWrapper from 'components/generic-wrappers/contact-disposition-wrapper'
import TemplateSelector from 'components/generic-selectors/template-selector'
import ParkCallIcon from 'components/icons/park-call-icon'
import ContactIcon from 'components/icons/contact-icon'
import ScriptSelector from 'components/generic-selectors/script-selector'
import VmDropSelector from 'components/generic-selectors/vm-drop-selector'
import RingGroupSelector from 'components/generic-selectors/ring-group-selector'
import AvailableUserSelector from 'components/generic-selectors/available-user-selector'
import * as CommunicationDirection from 'src/constants/communication-direction'
import * as CommunicationDispositionStatus from 'src/constants/communication-disposition-status'
import * as CommunicationStatus from 'src/constants/communication-status'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import * as CommunicationTypes from 'src/constants/communication-types'
import * as UploadedFileTypes from 'src/constants/uploaded-file-types'

export default {
  name: 'phone',

  components: {
    AvailableUserSelector,
    RingGroupSelector,
    VmDropSelector,
    ScriptSelector,
    ContactIcon,
    ParkCallIcon,
    TemplateSelector,
    ContactDispositionWrapper,
    CallDispositionWrapper,
    CommunicationTags,
    CommunicationNote,
    CommunicationAudio,
    VmDropIcon,
    IntegrationsIcon,
    ContactTags,
    ContactNotes,
    PauseRecordIcon,
    UnmuteIcon,
    UnholdIcon,
    TransferIcon,
    MoreIcon,
    AddIcon,
    ScriptsIcon,
    TagsIcon,
    NotesIcon,
    MuteIcon,
    HoldIcon,
    DialpadIcon,
    RecordIcon,
    Avatar,
    PersonIcon,
    AcceptCallIcon,
    CancelCallIcon,
    ContactIntegrations
  },

  mixins: [
    communicationInfoMixin
  ],

  props: {
    is_widget: {
      type: Boolean,
      required: false,
      default: false
    },

    ignore_calls: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  data () {
    return {
      pos1: 0,
      pos2: 0,
      pos3: 0,
      pos4: 0,
      rect: null,
      padding: {
        bottom: 5,
        left: 70,
        right: 5,
        top: 67
      },
      viewport: {
        bottom: 0,
        left: 0,
        right: 0,
        top: 0
      },
      isVisible: true,
      currentLocalTime: null,
      showLocalTime: true,
      inputDevice: 'default',
      outputDevice: 'default',
      loadingCommunication: false,
      loadingDropThirdParty: false,
      loadingToggleRecordingStatus: false,
      loadingMerge: false,
      loadingHold: false,
      loadingUnhold: false,
      loadingPark: false,
      loadingTransfer: false,
      loadingAdd: false,
      expanded: false,
      screen: 'call',
      bottomExpansion: 'integrations',
      expansionEnabled: true,
      digits: '',
      templateId: null,
      template: null,
      scriptId: null,
      script: null,
      vmDropId: null,
      vmDrop: null,
      loadingSendVmDrop: false,
      loadingSendMessage: false,
      devMode: false,
      transfer: {
        mode: 'user',
        userId: null,
        ringGroupId: null,
        phoneNumber: ''
      },
      CommunicationDirection,
      CommunicationDispositionStatus,
      CommunicationStatus,
      CommunicationCurrentStatus,
      CommunicationTypes,
      UploadedFileTypes
    }
  },

  computed: {
    ...mapState(['currentCompany', 'dialer', 'campaigns', 'users', 'warnings', 'inputDevices', 'outputDevices', 'currentInputDevice', 'currentOutputDevice']),

    isCallCompleted () {
      return ((this.dialer.communication && this.dialer.communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW) || ['HANGING_UP_CALL', 'CALL_DISCONNECTED', 'WRAP_UP'].includes(this.dialer.currentStatus))
    },

    isHangupDisabled () {
      return this.isCallCompleted
    },

    isAddDisabled () {
      return !this.devMode && (!this.dialer.communication || this.isCallCompleted || this.dialer.communication.in_cold_transfer || (this.currentCompany && !this.currentCompany.conferencing_enabled) || (this.dialer.communication.legc_uuid && [CommunicationStatus.STATUS_INPROGRESS_NEW, CommunicationStatus.STATUS_RINGING_NEW].includes(this.dialer.communication.legc_status)) || (this.dialer.communication.legz_uuid && this.dialer.call.callSid === this.dialer.communication.legz_uuid))
    },

    isTransferDisabled () {
      return !this.devMode && (!this.dialer.communication || this.isCallCompleted || (this.dialer.communication.legc_uuid && this.dialer.communication.legc_status === CommunicationStatus.STATUS_INPROGRESS_NEW) || (this.currentCompany && !this.currentCompany.conferencing_enabled) || (this.dialer.communication.legc_uuid && [CommunicationStatus.STATUS_INPROGRESS_NEW, CommunicationStatus.STATUS_RINGING_NEW].includes(this.dialer.communication.legc_status)) || (this.dialer.communication.legz_uuid && this.dialer.call.callSid === this.dialer.communication.legz_uuid))
    },

    isMoreDisabled () {
      return !this.devMode && this.isCallCompleted
    },

    isVmDropDisabled () {
      return !this.devMode && this.isCallCompleted
    },

    isHoldDisabled () {
      return (!this.dialer.communication || this.loadingHold || this.isCallCompleted || (this.currentCompany && !this.currentCompany.conferencing_enabled) || (this.dialer.communication.legc_uuid && [CommunicationStatus.STATUS_INPROGRESS_NEW, CommunicationStatus.STATUS_RINGING_NEW].includes(this.dialer.communication.legc_status)) || (this.dialer.communication.legz_uuid && this.dialer.call.callSid === this.dialer.communication.legz_uuid))
    },

    isParkDisabled () {
      return (!this.dialer.communication || this.loadingPark || this.dialer.parkedCall || this.isCallCompleted || (this.currentCompany && !this.currentCompany.conferencing_enabled) || (this.dialer.communication.legc_uuid && [CommunicationStatus.STATUS_INPROGRESS_NEW, CommunicationStatus.STATUS_RINGING_NEW].includes(this.dialer.communication.legc_status)) || (this.dialer.communication.legz_uuid && this.dialer.call.callSid === this.dialer.communication.legz_uuid))
    },

    isMuteDisabled () {
      return this.isCallCompleted
    },

    isRecordingDisabled () {
      return this.isCallCompleted
    },

    isCallAdded () {
      return (this.dialer.communication && this.dialer.communication.legc_uuid && this.dialer.communication.legc_status === CommunicationStatus.STATUS_INPROGRESS_NEW && !this.dialer.communication.in_cold_transfer && this.dialer.call.call_sid !== this.dialer.communication.legc_uuid && (!this.dialer.communication.legz_uuid || this.dialer.call.call_sid !== this.dialer.communication.legz_uuid))
    },

    transferValidated () {
      if (this.transfer.mode === 'user' && this.transfer.userId) {
        return true
      }

      if (this.transfer.mode === 'ring-group' && this.transfer.ringGroupId) {
        return true
      }

      if (this.transfer.mode === 'phone-number' && this.transfer.phoneNumber && this.$options.filters.fixPhone(this.transfer.phoneNumber)) {
        return true
      }

      return false
    },

    bottomExpansionLabel () {
      switch (this.bottomExpansion) {
        case 'integrations':
          return 'Integrations'
        case 'dialpad':
          return 'Dial Pad'
        case 'notes':
          return 'Add Notes'
        case 'tags':
          return 'Add Tags'
        case 'scripts':
          return 'Scripts'
        case 'add':
          return 'Add User'
        case 'transfer':
          return 'Transfer'
        case 'vm-drop':
          return 'VM Drop'
        case 'more':
          return 'More'
        default:
          return ''
      }
    },

    phoneStatus () {
      if (!this.dialer.communication) {
        return ''
      }

      switch (this.dialer.communication.current_status2) {
        case CommunicationCurrentStatus.CURRENT_STATUS_RINGING_NEW:
          return 'Calling...'
        default:
          return ''
      }
    },

    recordingText () {
      if (this.dialer.recordingStatus === 'in-progress' && this.dialer.communication && this.dialer.communication.should_record === true) {
        return 'Pause Rec'
      }

      if (this.dialer.recordingStatus === 'paused' && this.dialer.communication && this.dialer.communication.should_record === true) {
        return 'Start Rec'
      }

      return 'Start Rec'
    },

    signalStrength () {
      return 100 - (this.warnings.length * 25)
    },

    contactName () {
      if (this.dialer.contact) {
        return this.dialer.contact.name || 'No Name'
      }

      return 'No Name'
    },

    shouldShow () {
      return this.dialer && this.dialer.communication
    }
  },

  mounted () {
    this.$VueEvent.listen('togglePhone', () => {
      this.togglePhone()
    })

    this.setupDraggable()
    this.setupContactLocalTime()
    this.isVisible = true
    this.showLocalTime = true
  },

  methods: {
    setupDraggable () {
      if (!this.is_widget && this.shouldShow) {
        this.openPhone()
        setTimeout(() => {
          window.addEventListener('resize', this.resizeHandler)
          this.dragElement()
        }, 100)
      }
    },

    setupContactLocalTime () {
      if (this.dialer.contact) {
        this.getContactLocalTime()
        this.$options.localTimeInterval = setInterval(this.getContactLocalTime, 60 * 1000)
      }
    },

    hideLocalTime () {
      this.showLocalTime = false
    },

    getContactLocalTime () {
      if (this.dialer.contact && this.dialer.contact.timezone) {
        this.currentLocalTime = this.$moment.utc().tz(this.dialer.contact.timezone).format('h:mm a')
      }
    },

    goToContact () {
      if (this.dialer.contact) {
        this.$router.push({
          name: 'Contact',
          params: {
            id: this.dialer.contact.id
          }
        }).catch(err => {
          console.log(err)
        })
      }
    },

    copyPhoneNumber () {
      let phoneNumberClone = document.querySelector('#phone-number-clone')
      phoneNumberClone.setAttribute('type', 'text')
      phoneNumberClone.select()

      try {
        document.execCommand('copy')
        this.$q.notify({
          message: 'Phone number copied to clipboard.',
          type: 'positive',
          textColor: 'white',
          position: 'bottom-right'
        })
      } catch (err) {
        this.$q.notify({
          message: 'Error copying phone number to clipboard.',
          type: 'negative',
          textColor: 'white',
          position: 'bottom-right'
        })
      }

      /* unselect the range */
      phoneNumberClone.setAttribute('type', 'hidden')
      window.getSelection().removeAllRanges()
    },

    endCall ($event) {
      this.saveAndResetExpansion($event)
      this.$VueEvent.fire('hangupCall')
    },

    hangupCall ($event) {
      this.saveAndResetExpansion($event)
      this.$VueEvent.fire('hangupCall')
    },

    answerCall () {
      this.$VueEvent.fire('answerCall')
      this.screen = 'menu'
    },

    rejectCall () {
      this.$VueEvent.fire('rejectCall')
      this.closePhone()
    },

    toggleMute () {
      this.$VueEvent.fire('toggleMute')
    },

    toggleHold () {
      if (this.dialer.isHeld) {
        this.loadingUnhold = true
      } else {
        this.loadingHold = true
      }

      this.$VueEvent.fire('toggleHold')

      setTimeout(() => {
        if (this.dialer.isHeld) {
          this.loadingHold = false
        } else {
          this.loadingUnhold = false
        }
      }, 1000)
    },

    openDialpad () {
      this.expansionEnabled = true
      this.bottomExpansion = 'dialpad'
      setTimeout(() => {
        this.expanded = true
      }, 50)
    },

    openNotes () {
      this.expansionEnabled = true
      this.bottomExpansion = 'notes'
      setTimeout(() => {
        this.expanded = true
      }, 50)
    },

    openTags () {
      this.expansionEnabled = true
      this.bottomExpansion = 'tags'
      setTimeout(() => {
        this.expanded = true
      }, 50)
    },

    openScripts () {
      this.expansionEnabled = true
      this.bottomExpansion = 'scripts'
      setTimeout(() => {
        this.expanded = true
      }, 50)
    },

    openAdd () {
      this.expansionEnabled = true
      this.bottomExpansion = 'add'
      setTimeout(() => {
        this.expanded = true
      }, 50)
    },

    openTransfer () {
      this.resetTransfer()
      this.expansionEnabled = true
      this.bottomExpansion = 'transfer'
      setTimeout(() => {
        this.expanded = true
      }, 50)
    },

    openMore () {
      this.expansionEnabled = true
      this.bottomExpansion = 'more'
      setTimeout(() => {
        this.expanded = true
      }, 50)
    },

    openVmDrop () {
      this.expansionEnabled = true
      this.bottomExpansion = 'vm-drop'
      setTimeout(() => {
        this.expanded = true
      }, 50)
    },

    openIntegrations () {
      this.expansionEnabled = true
      this.bottomExpansion = 'integrations'
      setTimeout(() => {
        this.expanded = true
      }, 50)
    },

    openContact ($event) {
      this.saveAndResetExpansion($event)
      this.goToContact()
    },

    parkCall ($event) {
      this.loadingPark = true
      this.$VueEvent.fire('parkCall')
      this.saveAndResetExpansion($event)
      setTimeout(() => {
        this.loadingPark = false
      }, 1000)
    },

    saveAndResetExpansion ($event) {
      if ($event) {
        $event.stopPropagation()
        $event.preventDefault()
      }
      this.expansionEnabled = false
      this.expanded = false
    },

    onNotesUpdate (contact) {
      this.setDialerContact(contact)
    },

    onTagsUpdate (tags) {
      this.setDialerContactTags(tags)
    },

    toggleRecordingStatus () {
      this.loadingToggleRecordingStatus = true
      this.$VueEvent.fire('toggleRecordingStatus')
      setTimeout(() => {
        this.loadingToggleRecordingStatus = false
      }, 1000)
    },

    handleLongPress (isLong = false) {
      if (isLong) {
        this.sendDigit('+')
      } else {
        this.sendDigit('0')
      }
    },

    sendDigit (digit) {
      this.digits += digit.toString()
      this.$VueEvent.fire('sendDigit', digit)
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

    togglePhone () {
      this.isVisible = !this.isVisible
    },

    openPhone () {
      this.isVisible = true
    },

    closePhone () {
      this.isVisible = false
    },

    endWrapUp () {
      this.$VueEvent.fire('endWrapUp')
    },

    makeCall () {
      if (!this.dialer.communication) {
        return
      }

      let data = {
        currentNumber: this.$options.filters.fixPhone(this.dialer.communication.lead_number),
        outboundCampaignId: this.dialer.communication.campaign_id,
        contactName: this.contactName,
        companyName: (this.dialer.contact) ? this.dialer.contact.company_name : '',
        contactId: this.dialer.communication.contact_id
      }

      this.endWrapUp()

      this.$VueEvent.fire('makeCall', data)
    },

    resizeHandler (e) {
      e = e || window.event
      if (this.$refs.phone) {
        this.$refs.phone.style.bottom = 'auto'
        this.$refs.phone.style.left = 'auto'
      }
    },

    dragElement () {
      if (this.$refs.phoneHeader) {
        // if present, the header is where you move the DIV from:
        this.$refs.phoneHeader.onmousedown = this.dragMouseDown
      }
    },

    dragMouseDown (e) {
      e = e || window.event
      e.preventDefault()
      // get the mouse cursor position at startup:
      this.pos3 = e.clientX
      this.pos4 = e.clientY

      // store the current viewport and element dimensions when a drag starts
      this.rect = this.$refs.phone.getBoundingClientRect()
      this.viewport.bottom = window.innerHeight - this.padding.bottom
      this.viewport.left = this.padding.left
      this.viewport.right = window.innerWidth - this.padding.right
      this.viewport.top = this.padding.top

      // add active class
      this.$refs.phone.classList.add('active')

      document.onmouseup = this.closeDragElement
      // call a function whenever the cursor moves:
      document.onmousemove = this.elementDrag
    },

    elementDrag (e) {
      e = e || window.event
      e.preventDefault()
      // calculate the new cursor position:
      this.pos1 = this.pos3 - e.clientX
      this.pos2 = this.pos4 - e.clientY
      this.pos3 = e.clientX
      this.pos4 = e.clientY

      // check to make sure the element will be within our viewport boundary
      let newLeft = this.$refs.phone.offsetLeft - this.pos1
      let newTop = this.$refs.phone.offsetTop - this.pos2

      if (newLeft < this.viewport.left ||
        newTop < this.viewport.top ||
        newLeft + this.rect.width > this.viewport.right ||
        newTop + this.rect.height > this.viewport.bottom
      ) {
        // the element will hit the boundary, do nothing...
      } else {
        // set the element's new position:
        this.$refs.phone.style.top = (this.$refs.phone.offsetTop - this.pos2) + 'px'
        this.$refs.phone.style.left = (this.$refs.phone.offsetLeft - this.pos1) + 'px'
      }
    },

    closeDragElement () {
      // remove active class
      this.$refs.phone.classList.remove('active')
      // stop moving when mouse button is released:
      document.onmouseup = null
      document.onmousemove = null
    },

    setInputDevice () {
      this.$VueEvent.fire('setInputDevice', this.inputDevice)
    },

    setOutputDevice () {
      this.$VueEvent.fire('setOutputDevice', this.outputDevice)
    },

    testOutputDevice () {
      this.$VueEvent.fire('testOutputDevice', this.outputDevice)
    },

    forceRefreshCommunication ($event) {
      $event.target.blur()
      this.loadingCommunication = true
      this.$VueEvent.fire('forceRefreshCommunication')
      setTimeout(() => {
        this.loadingCommunication = false
      }, 1000)
    },

    resetBottomExpansion () {
      this.bottomExpansion = 'integrations'
      this.expanded = false
      this.expansionEnabled = true
    },

    changeTemplate (template) {
      if (template) {
        this.templateId = template.id
      }
      this.template = template
    },

    changeScript (script) {
      if (script) {
        this.scriptId = script.id
      }
      this.script = script
    },

    changeVmDrop (vmDrop) {
      if (vmDrop) {
        this.vmDropId = vmDrop.id
      }
      this.vmDrop = vmDrop
    },

    sendVmDrop ($event) {
      if (!this.dialer.communication || this.isCallCompleted || !this.vmDrop) {
        return
      }

      this.loadingSendVmDrop = true
      this.$axios.post('/api/v1/dialer/play-prerecorded-voicemail', {
        communication_id: this.dialer.communication.id,
        file_name: this.vmDrop.uploaded_file.uuid,
        name: this.vmDrop.name
      }).then(res => {
        this.vmDrop = null
        this.vmDropId = null
        this.loadingSendVmDrop = false
        this.saveAndResetExpansion($event)
        this.$q.notify({
          offset: 95,
          title: 'Phone',
          message: 'Voicemail left',
          type: 'success',
          showClose: true
        })
      }).catch(err => {
        console.log(err)
      }).finally(_ => {
        this.loadingSendVmDrop = false
      })
    },

    sendMessage () {
      if (!this.dialer.communication || !this.template) {
        return
      }

      this.loadingSendMessage = true
      this.$axios.post('/api/v1/campaign/send-message/' + this.dialer.communication.campaign_id + '/' + this.dialer.communication.contact_id, {
        message: this.template.body,
        phone_number: this.dialer.communication.lead_number
      }).then(res => {
        this.template = null
        this.templateId = null
        this.loadingSendMessage = false
        this.$q.notify({
          offset: 95,
          title: 'Phone',
          message: 'Message sent',
          type: 'success',
          showClose: true
        })
      }).catch(err => {
        console.log(err)
      }).finally(_ => {
        this.loadingSendMessage = false
      })
    },

    resetTransfer () {
      this.transfer.userId = null
      this.transfer.ringGroupId = null
      this.transfer.phoneNumber = ''
      this.transfer.mode = 'user'
    },

    changeTransferUser (userId) {
      this.transfer.ringGroupId = null
      this.transfer.phoneNumber = ''
      this.transfer.userId = userId
    },

    changeTransferRingGroup (ringGroupId) {
      this.transfer.userId = null
      this.transfer.phoneNumber = ''
      this.transfer.ringGroupId = ringGroupId
    },

    changeTransferPhoneNumber () {
      this.transfer.userId = null
      this.transfer.ringGroupId = null
    },

    getUsers () {
      this.transfer.userId = null
      if (this.$refs.availableUserSelector) {
        this.$refs.availableUserSelector.getUsers()
      }
    },

    transferCall () {
      this.loadingTransfer = true
      this.$VueEvent.fire('transferCall', this.transfer)
      setTimeout(() => {
        this.loadingTransfer = false
      }, 1000)
    },

    ...mapActions([
      'setDialerContact',
      'setDialerContactTags'
    ])
  },

  watch: {
    shouldShow () {
      this.setupDraggable()
      this.setupContactLocalTime()
      this.resetBottomExpansion()
      this.screen = 'call'
      this.digits = ''
    },

    screen () {
      console.log('Current screen: ' + this.screen)
    },

    dialer: {
      handler () {
        if (!this.dialer.communication) {
          return
        }

        if (this.dialer.communication.current_status2 === CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW && !['HANGING_UP_CALL', 'CALL_DISCONNECTED', 'WRAP_UP'].includes(this.dialer.currentStatus)) {
          this.screen = 'menu'
        }
      },
      deep: true
    },

    'dialer.currentStatus': function () {
      switch (this.dialer.currentStatus) {
        case 'READY':
          this.screen = 'call'
          break
        case 'OFFLINE':
          this.screen = 'call'
          break
        case 'RECEIVED_CALL_INVITE':
          this.screen = 'call'
          break
        case 'INVITE_CANCELLED':
          this.screen = 'call'
          break
        case 'WRAP_UP':
          this.screen = 'wrap-up'
          this.resetBottomExpansion()
          break
        case 'GENERATING_TOKEN':
          this.screen = 'call'
          this.closePhone()
          break
        case 'TOKEN_GENERATED':
          this.screen = 'call'
          this.closePhone()
          break
        case 'MAKING_CALL':
          this.screen = 'call'
          break
        case 'ANSWERING_CALL':
          this.screen = 'call'
          break
        case 'REJECTING_CALL':
          this.screen = 'call'
          break
        case 'CALL_CONNECTED':
          if (this.dialer.call && this.dialer.call.direction === 'INCOMING') {
            this.screen = 'menu'
          }

          if (this.dialer.call && this.dialer.call.direction === 'OUTGOING') {
            this.screen = 'menu'
          }
          break
        case 'GOT_ERROR':
          // ?
          break
        case 'RESTARTING':
          // ?
          break
        case 'HANGING_UP_CALL':
          // ?
          break
        case 'CALL_DISCONNECTED':
          // ?
          break
      }
    },

    'dialer.contact': function () {
      this.setupContactLocalTime()
    },

    isCallCompleted () {
      this.resetBottomExpansion()
      this.expansionEnabled = false
    }
  },

  beforeDestroy () {
    window.removeEventListener('resize', this.resizeHandler)
    this.$VueEvent.stop('togglePhone')
    clearInterval(this.$options.localTimeInterval)
  }
}
</script>
