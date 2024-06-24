<template>
  <div class="phone d-flex flex-column"
       ref="phone"
       :class="{ 'invisible': !isVisible, 'no-padding': loadingPhone, 'phone-widget': is_widget }"
       v-if="loadingPhone || shouldShow">
    <mobile-live-call-bar :hide-live-call="true" />
    <div class="phone-header d-flex grabbable d-flex justify-content-between align-items-center flex-grow-0"
         ref="phoneHeader"
         :class="{ 'call-ended': isCallCompleted }">
      <div class="d-flex flex-row text-size-rg _500 text-white width-65"
           v-if="shouldShow">
        <span v-if="dialer.timer">{{ dialer.timer }}</span>
        <span v-else-if="isCallCompleted"></span>
        <span v-else>
          0:00
        </span>
      </div>
      <div class="d-flex flex-row text-xs text-white">
        <span v-if="isCallCompleted">Call Ended</span>
        <span v-else-if="dialer.communication && getCampaign(dialer.communication.campaign_id)">
          {{ getCampaign(dialer.communication.campaign_id).name | truncate(15) }}
        </span>
      </div>
      <div :class="[
              'd-flex', 'flex-row', 'justify-content-between', 'align-items-center',
              ((is_widget && isCallCompleted) || (is_widget && loadingPhone)) ? 'width-32' : 'width-65'
            ]">
        <pause-record-icon width="14"
                           height="14"
                           v-show="pauseRecordIconShow">
        </pause-record-icon>

        <ul id="signal-strength">
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

        <q-btn-dropdown class="tab-dropdown no-arrow"
                        ref="menu"
                        flat
                        :ripple="false"
                        :menu-offset="[29, 8]">
          <template v-slot:label>
            <q-btn class="icon-btn auto-size height-12 phone-settings-icon"
                   icon="img:app-icons/dialer/phone_settings.svg"
                   size="12px"
                   padding="none"
                   flat>
            </q-btn>
          </template>

          <div class="phone-settings">
            <q-item-label class="mb-1">Input device</q-item-label>
            <device-selector :devices="inputDevices"
                             v-model="currentInputDevice"
                             @change="setInputDevice">
            </device-selector>
            <q-item-label class="mt-3 mb-1">Output device</q-item-label>
            <device-selector :devices="outputDevices"
                             v-model="currentOutputDevice"
                             @change="setOutputDevice">
            </device-selector>

            <q-btn class="full-width border-half-rounded mt-2 text-size-sm q-pa-xs"
                   color="primary"
                   label="Speaker Test"
                   no-caps
                   unelevated
                   @click="testOutputDevice">
            </q-btn>

            <button class="btn text-size-sm _400 text-grey-100 p-0 mt-2 d-flex align-items-center"
                    @click="forceRefreshCommunication">
              <i class="material-icons">refresh</i>
              <span class="ml-2">Refresh</span>
            </button>
          </div>
        </q-btn-dropdown>

        <q-btn v-show="!is_widget"
               class="icon-btn auto-size height-12"
               icon="img:app-icons/dialer/phone_exit.svg"
               size="12px"
               padding="none"
               flat
               @click="closePhone">
        </q-btn>
      </div>
    </div>
    <div class="bg-dark d-flex align-items-center justify-content-center h-100 flex-grow-1 overflow-hidden"
         v-if="loadingPhone">
      <q-spinner-bars color="white"
                      size="2em" />
    </div>
    <template v-if="!loadingPhone && shouldShow">
      <div class="phone-body d-flex flex-column flex-grow-1 align-items-center justify-content-around">
        <template v-if="isPhoneBodyVisible">
          <div class="phone-notice d-flex flex-column align-items-center"
               v-if="contact && dialer.call && dialer.call.direction === 'OUTGOING' && showLocalTime">
            <q-banner class="bg-primary text-white pt-1 pb-1"
                      inline-actions
                      rounded
                      dense>
              <template v-slot:avatar>
                <q-icon class="text-size-rg"
                        name="o_info"
                        color="white">
                </q-icon>
              </template>
              <span class="text-size-xs">It's {{ currentLocalTime }} in the timezone of the person you are calling</span>
              <template v-slot:action>
                <q-btn class="text-size-rg"
                       color="white"
                       icon="o_cancel"
                       padding="none"
                       flat
                       round
                       @click="hideLocalTime">
                </q-btn>
              </template>
            </q-banner>
          </div>
          <div class="phone-info d-flex flex-column align-items-center">
            <person-icon />

            <div class="text-white text-center">
              <q-item-label class="text-size-xxl _600 mt-2 d-flex align-items-center justify-content-center"
                            v-if="contact || hasCallFishingContact">
                <span class="d-inline-flex">
                  {{ contactName | truncate(15) }}
                </span>
                <q-btn v-if="!is_widget"
                       class="text-size-rg d-inline-flex ml-1"
                       color="white"
                       icon="o_info"
                       flat
                       round
                       @click="goToContact">
                </q-btn>
              </q-item-label>
              <q-item-label class="text-size-sm _400 mt-1 d-flex align-items-center justify-content-center">
                <span class="d-inline-flex">{{ leadNumber }}</span>
                <b-link class="copy-phone-number text-white d-inline-flex ml-1"
                        href="#"
                        @click.prevent="copyPhoneNumber(leadNumberRaw)">
                  <copy-icon />
                </b-link>
              </q-item-label>
              <q-item-label class="text-size-sm _400 mt-1"
                            v-if="companyName">
                {{ companyName }}
              </q-item-label>
            </div>
          </div>
          <div class="phone-status d-flex justify-content-center"
               v-if="phoneStatus">
            <span>{{ phoneStatus }}</span>
          </div>
          <div class="phone-cta">
            <div class="d-flex flex-row"
                 :class="phoneCtaClass"
                 v-if="isPhoneCTAVisible">
              <div class="d-flex flex-column align-items-center"
                   v-if="isDeclineCallVisible">
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
              <div class="d-flex flex-column align-items-center"
                   v-if="isIgnoreCallVisible">
                <q-btn class="height-52"
                       ripple
                       round
                       no-caps
                       @click="rejectCall">
                  <ignore-call-icon width="52"
                                    height="52">
                  </ignore-call-icon>
                </q-btn>
                <span class="text-size-xs mt-1">Ignore</span>
              </div>

              <div class="d-flex flex-column align-items-center"
                   v-if="isAnswerCallVisible">
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

              <div class="d-flex flex-column align-items-center"
                   v-if="isUnparkCallVisible">
                <q-btn class="height-52"
                       ripple
                       round
                       no-caps
                       @click="unparkCommunication">
                  <parked-call-icon width="52"
                                    height="52">
                  </parked-call-icon>
                </q-btn>
                <span class="text-size-xs mt-1">Unpark</span>
              </div>
            </div>

            <div class="d-flex flex-column justify-content-center align-items-center"
                 v-if="isHangupCallVisible">
              <q-btn class="height-52"
                     round
                     no-caps
                     :disable="dialer.currentStatus === 'MAKING_CALL'"
                     :class="hangupCallClass"
                     @click="hangupCall">
                <cancel-call-icon width="52"
                                  height="52">
                </cancel-call-icon>
              </q-btn>
              <span class="text-size-xs mt-1">Hangup</span>
            </div>
          </div>
        </template>
        <template v-else-if="screen === 'menu'">
          <div class="phone-main d-flex flex-column align-items-center">
            <div class="dummy bg-dark w-100 height-36"></div>
            <div class="phone-avatar">
              <avatar class="contact-avatar"
                      width="50"
                      height="50"
                      :name="contactName"
                      v-if="!isCallAdding && !isCallAdded">
              </avatar>
              <participants-icon v-else />
            </div>
            <div class="phone-info small d-flex flex-column align-items-center"
                 v-if="!isCallAdding && !isCallAdded">
              <div class="text-grey-100 text-center">
                <q-item-label class="text-size-xxl _600 mt-2 d-flex align-items-center justify-content-center"
                              v-if="contact">
                  <span class="d-inline-flex">{{ contactName | truncate(15) }}</span>
                  <q-btn v-if="!is_widget"
                         class="text-size-rg d-inline-flex ml-1"
                         color="text-grey-100"
                         icon="o_info"
                         flat
                         round
                         @click="goToContact">
                  </q-btn>
                </q-item-label>
                <q-item-label class="text-size-sm _400 mt-1 d-flex align-items-center justify-content-center">
                  <span class="d-inline-flex">{{ dialer.communication.lead_number | fixPhone }}</span>
                  <b-link class="copy-phone-number text-grey-100 d-inline-flex ml-1"
                          href="#"
                          @click.prevent="copyPhoneNumber(dialer.communication.lead_number)">
                    <copy-icon />
                  </b-link>
                </q-item-label>
                <q-item-label class="text-size-sm text-grey-90 _400 mt-1"
                              v-if="contact && (contact.company_name || currentLocalTime)">
                  <span v-if="contact.company_name">{{ contact.company_name }}</span>
                  <span class="ml-1 mr-1"
                        v-if="contact.company_name && currentLocalTime">
                    ·
                  </span>
                  <span v-if="currentLocalTime">{{ currentLocalTime }}</span>
                </q-item-label>
              </div>
            </div>
            <div class="phone-info w-100 mt-2 pl-2 pr-2 small d-flex flex-column align-items-start"
                 v-else>
              <div class="d-flex justify-content-between align-items-center w-100 pr-2">
                <q-item-label class="cursor-pointer"
                              v-if="contact"
                              @click="openExpansion('members')">
                  <div class="d-flex align-items-center">
                    <ready-icon v-if="!shouldIntroduce" />
                    <waiting-icon v-else />
                    <span class="ml-2 text-size-xxl _600 text-grey-100">{{ contactName | truncate(15) }}</span>
                  </div>
                </q-item-label>
                <q-btn class="d-flex align-items-center justify-content-between merge-btn"
                       color="success"
                       label="Merge"
                       ripple
                       outline
                       rounded
                       no-caps
                       unelevated
                       dense
                       :loading="loadingMerge"
                       :disabled="isIntroduceDisabled"
                       v-if="shouldIntroduce"
                       @click="mergeCalls">
                  <merge-icon class="ml-2" />
                </q-btn>
              </div>

              <div class="d-flex justify-content-between align-items-center mt-3 w-100 pr-2"
                   v-if="addedParty">
                <q-item-label class="cursor-pointer"
                              @click="openExpansion('members')">
                  <div class="d-flex align-items-center">
                    <ready-icon />
                    <span class="ml-2 text-size-xxl _600 text-grey-100">{{ addedParty.name | truncate(15) }}</span>
                  </div>
                  <div class="mt-1">
                    <span class="add-status"
                          v-if="isCallAdding">
                      Adding
                    </span>
                    <span class="add-status"
                          v-if="devMode && isCallAdded">
                      Added
                    </span>
                  </div>
                </q-item-label>
                <q-btn class="height-24"
                       ripple
                       round
                       no-caps
                       unelevated
                       :loading="loadingDropThirdParty"
                       :disabled="loadingDropThirdParty"
                       @click="dropThirdParty">
                  <drop-participant-icon />
                </q-btn>
              </div>
            </div>

            <div class="d-flex justify-content-between w-100 mt-3 pl-3 pr-3 actions-block">
              <button class="phone-buttons btn"
                      :disabled="isMuteDisabled"
                      @click="toggleMute">
                <mute-icon :width="iconSizes.mute.width"
                           :height="iconSizes.mute.height"
                           v-show="!dialer.isMuted">
                </mute-icon>
                <unmute-icon :width="iconSizes.mute.width"
                             :height="iconSizes.mute.height"
                             v-show="dialer.isMuted">
                </unmute-icon>
                <span>{{ dialer.isMuted ? 'Unmute' : 'Mute' }}</span>
              </button>
              <button class="phone-buttons btn"
                      :disabled="isHoldDisabled || loadingHold || loadingUnhold"
                      @click="toggleHold">
                <hold-icon :width="iconSizes.hold.width"
                           :height="iconSizes.hold.height"
                           v-show="!dialer.isHeld">
                </hold-icon>
                <unhold-icon :width="iconSizes.hold.width"
                             :height="iconSizes.hold.height"
                             v-show="dialer.isHeld">
                </unhold-icon>
                <span>{{ dialer.isHeld ? 'Unhold' : 'Hold' }}</span>
              </button>
              <button class="phone-buttons btn"
                      @click="openExpansion('dialpad')">
                <dialpad-icon :width="iconSizes.keypad.width"
                              :height="iconSizes.keypad.height">
                </dialpad-icon>
                <span>Keypad</span>
              </button>
              <button class="phone-buttons btn"
                      :disabled="isDisabledPhoneButtons"
                      @click="toggleRecordingStatus">
                <record-icon :width="iconSizes.recording.width"
                             :height="iconSizes.recording.height"
                             v-show="dialer.recordingStatus === 'paused' && dialer.communication.should_record === true">
                </record-icon>
                <pause-record-icon :width="iconSizes.recording.width"
                                   :height="iconSizes.recording.height"
                                   v-show="dialer.recordingStatus === 'in-progress' && dialer.communication.should_record === true">
                </pause-record-icon>
                <pause-record-icon pathColor="#95989E"
                                   circle-color="#95989E"
                                   :width="iconSizes.recording.width"
                                   :height="iconSizes.recording.height"
                                   v-show="dialer.communication.should_record !== true">
                </pause-record-icon>
                <span>{{ recordingText }}</span>
              </button>
            </div>
            <div class="d-flex justify-content-between w-100 mt-3 pl-3 pr-3 actions-block">
              <button class="phone-buttons elevated btn"
                      @click="openExpansion('notes')">
                <notes-icon :width="iconSizes.notes.width"
                            :height="iconSizes.notes.height">
                </notes-icon>
                <span>Notes</span>
              </button>
              <button class="phone-buttons elevated btn"
                      @click="openExpansion('tags')">
                <tags-icon :width="iconSizes.tags.width"
                           :height="iconSizes.tags.height">
                </tags-icon>
                <span>Tags</span>
              </button>
              <button class="phone-buttons elevated btn"
                      :disabled="isVmDropDisabled"
                      @click="openExpansion('vm-drop')">
                <vm-drop-icon :width="iconSizes.vmdrop.width"
                              :height="iconSizes.vmdrop.height">
                </vm-drop-icon>
                <span>VM Drop</span>
              </button>
            </div>
            <div class="d-flex justify-content-between w-100 mt-5 pl-3 pr-3 actions-block">
              <button class="phone-buttons btn"
                      :disabled="isHangupDisabled"
                      @click="endCall">
                <cancel-call-icon :width="iconSizes.call.width"
                                  :height="iconSizes.call.height">
                </cancel-call-icon>
              </button>
              <button class="phone-buttons btn"
                      :disabled="isAddDisabled"
                      @click="openExpansion('add')">
                <add-icon :width="iconSizes.add.width"
                          :height="iconSizes.add.height">
                </add-icon>
                <span>Add</span>
              </button>
              <button class="phone-buttons btn"
                      :disabled="isTransferDisabled"
                      @click="openExpansion('transfer')">
                <transfer-icon :width="iconSizes.transfer.width"
                               :height="iconSizes.transfer.height">
                </transfer-icon>
                <span>Transfer</span>
              </button>
              <button class="phone-buttons btn"
                      :disabled="isMoreDisabled"
                      @click="openExpansion('more')">
                <more-icon :width="iconSizes.more.width"
                           :height="iconSizes.more.height">
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
                        :useMinWidth="true"
                        width="40"
                        height="40"
                        :name="contact.name"
                        v-if="contact">
                </avatar>
                <div class="ml-2 flex-grow-1 d-inline-flex justify-content-between contact-details">
                  <div class="mr-auto">
                    <p class="contact-name mb-1">
                      <span class="d-inline-flex">{{ contactName }}</span>
                      <q-btn v-if="!is_widget"
                             class="text-size-rg d-inline-flex ml-1"
                             color="black"
                             icon="o_info"
                             flat
                             round
                             @click="goToContact">
                      </q-btn>
                    </p>
                    <p class="text-sm-left contact-phone mb-1"
                       v-if="contact">
                      <span>{{ contact.phone_number | fixPhone }}</span>
                      <b-link class="copy-phone-number text-grey-100 d-inline-flex ml-1"
                              href="#"
                              @click.prevent="copyPhoneNumber(contact.phone_number)">
                        <copy-icon/>
                      </b-link>
                    </p>
                  </div>
                </div>
              </b-list-group-item>
            </b-list-group>

            <q-item-section class="d-flex flex-row border-bottom justify-content-start flex-grow-0 pt-2 pb-2"
                            v-if="dialer.communication">
              <div class="pr-2">
                <component :is="stateToIcon(dialer.communication.disposition_status2, dialer.communication.type, dialer.communication.direction, dialer.communication.callback_status)"
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

            <div class="d-flex flex-column pt-2 pb-2 w-100 border-bottom"
                 v-if="dialer.communication">
              <label class="form-control-label text-grey-90">
                Call Disposition
              </label>
              <div class="d-flex flex-row align-items-center w-100">
                <call-disposition-wrapper class="w-100"
                                          :highlighted="isHighlightedCallDisposition"
                                          :required="isHighlightedCallDisposition"
                                          :communication="dialer.communication"
                                          @change="onCallDisposed">
                </call-disposition-wrapper>
              </div>
            </div>

            <div class="d-flex flex-column pt-2 pb-2 w-100 border-bottom"
                 v-if="dialer.communication">
              <label class="form-control-label text-grey-90">
                Hubspot Type
              </label>
              <div class="d-flex flex-row align-items-center w-100">
                <hubspot-activity-type-selector :communication="dialer.communication"></hubspot-activity-type-selector>
              </div>
            </div>

            <div class="d-flex flex-column pt-2 pb-2 w-100 border-bottom">
              <label class="form-control-label text-grey-90">
                Contact Disposition
              </label>
              <div class="d-flex flex-row align-items-center w-100">
                <contact-disposition-wrapper class="w-100"
                                             :highlighted="isHighlightedContactDisposition"
                                             :required="isHighlightedContactDisposition"
                                             :contact="contact"
                                             @change="onContactDisposed">
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
                  <b-button variant="primary"
                            size="sm"
                            :loading="loadingSendMessage"
                            :disabled="loadingSendMessage || !template"
                            @click="sendMessage">
                    <span>Send</span>
                  </b-button>
                </div>
              </div>
            </div>

            <div class="d-flex flex-column pt-2 pb-2 w-100 border-bottom"
                 v-if="dialer.communication">
              <div class="d-flex flex-row align-items-center w-100 mb-2">
                <label class="form-control-label mb-0 text-grey-90">Started at:</label>
                <span class="ml-2">{{ dialer.communication.created_at | fixCommunicationDateTime }}</span>
              </div>
              <div class="d-flex flex-row align-items-center w-100">
                <label class="form-control-label mb-0 text-grey-90">Duration:</label>
                <span class="ml-2">{{ dialer.communication.duration | fixDuration }}</span>
              </div>
            </div>

            <div class="d-flex align-items-center pt-2 pb-2 w-100 border-bottom"
                 v-if="dialer.communication">
              <label class="form-control-label mb-0 text-grey-90">Line:</label>
              <span class="ml-2"
                    v-if="getCampaign(dialer.communication.campaign_id)">
                {{ getCampaign(dialer.communication.campaign_id).name }}
              </span>
            </div>

            <div class="d-flex flex-column pt-2 pb-2 w-100 border-bottom"
                 v-if="dialer.communication">
              <label class="form-control-label text-grey-90"
                     v-if="showAudio(dialer.communication)">
                Call Recording
              </label>
              <div class="d-flex align-items-center w-100"
                   v-if="showAudio(dialer.communication)">
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

            <div class="d-flex flex-column pt-2 pb-2 w-100 border-bottom"
                 v-if="dialer.communication">
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

            <div class="d-flex flex-column pt-2 pb-2 w-100 border-bottom"
                 v-if="dialer.communication">
              <label class="form-control-label text-grey-90">Tags</label>
              <div class="d-flex align-items-center w-100">
                <entity-tags data-testid="phone-communication-tags-multi-select"
                             entity="communication"
                             entity-type="contacts"
                             :entity-object="dialer.communication"
                             :category="TagCategories.CAT_COMMUNICATIONS"
                             :use-card="false"
                             :use-add-icon="true" />
              </div>
            </div>

            <div class="d-flex flex-column pt-2 pb-2 w-100 border-bottom"
                 v-if="dialer.communication">
              <label class="form-control-label text-grey-90">Notes</label>
              <div class="d-flex align-items-center w-100">
                <communication-note ref="communicationNotes"
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
                  :disabled="isNotDisposed"
                  @click="makeCall">
          <b-icon icon="telephone-fill"
                  aria-hidden="true">
          </b-icon>
          <span class="ml-1">Call Back</span>
        </b-button>

        <b-button variant="primary"
                  :disabled="isNotDisposed"
                  @click="endWrapUp">
          <span>Finish</span>
          <span v-if="dialer.wrapUpTimer"> ({{ dialer.wrapUpTimer }}s)</span>
        </b-button>
      </div>
      <div class="phone-expansion d-flex overlay"
           v-if="isPhoneExpansionAvailable">
        <q-expansion-item class="shadow-1 overflow-hidden w-100"
                          header-class="text-sm bg-white text-center"
                          expand-icon-class="text-grey-100"
                          switch-toggle-side
                          dense
                          v-model="expanded">
          <template v-slot:header>
            <q-item-section>
              <q-item-label>{{ bottomExpansionLabel }}</q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-btn class="no-q-btn-focus"
                     color="primary"
                     no-caps
                     unelevated
                     dense
                     flat
                     :ripple="false"
                     :class="[ !expanded ? 'invisible' : '']"
                     :label="phoneExpansionLabel"
                     @click="saveAndResetExpansion">
              </q-btn>
            </q-item-section>
          </template>

          <q-card>
            <template v-if="bottomExpansion === 'members'">
              <q-card-section class="height-240">
                <div class="text-grey-100">
                  <q-item-label class="text-size-xxl _600 mt-2 d-flex align-items-center justify-content-start"
                                v-if="contact">
                    <span class="d-inline-flex">{{ contactName | truncate(15) }}</span>
                  </q-item-label>
                  <q-item-label class="text-size-sm _400 mt-1 d-flex align-items-center justify-content-start"
                                v-if="dialer.communication">
                    <span class="d-inline-flex">{{ dialer.communication.lead_number | fixPhone }}</span>
                    <b-link href="#"
                            class="copy-phone-number text-grey-100 d-inline-flex ml-1"
                            @click.prevent="copyPhoneNumber(dialer.communication.lead_number)">
                      <i class="material-icons">content_copy</i>
                    </b-link>
                  </q-item-label>
                  <q-item-label class="text-size-sm text-grey-90 _400 mt-1"
                                v-if="contact && contact.company_name">
                    <span>{{ contact.company_name }}</span>
                    <span class="ml-1 mr-1"
                          v-if="currentLocalTime">
                      ·
                    </span>
                    <span v-if="currentLocalTime">{{ currentLocalTime }}</span>
                  </q-item-label>
                </div>
                <q-separator class="mt-3 mb-3"
                             inset>
                </q-separator>
                <div class="text-grey-100"
                     v-if="addedParty">
                  <q-item-label class="text-size-xxl _600 mt-2 d-flex align-items-center justify-content-start">
                    <span class="d-inline-flex"
                          v-if="addedParty.name">
                      {{ addedParty.name | truncate(15) }}
                    </span>
                    <span class="d-inline-flex"
                          v-else>
                      {{ addedParty }}
                    </span>
                  </q-item-label>
                  <div class="text-size-sm _400 mt-1 d-flex align-items-center justify-content-start"
                       v-if="addedParty.id">
                    <q-item-label class="text-size-sm text-grey-90 _400 mt-1"
                                  v-if="!addedParty.is_destination">
                      {{ addedParty.email }} - {{ getLabel(addedParty) }}
                    </q-item-label>
                    <q-item-label class="text-size-sm text-grey-90 _400 mt-1"
                                  v-else>
                      {{ getLabel(addedParty) }}
                    </q-item-label>
                  </div>
                  <div class="text-size-sm _400 mt-1 d-flex align-items-center justify-content-start"
                       v-else>
                    <q-item-label class="text-size-sm text-grey-90 _400 mt-1">No other data found for this user.</q-item-label>
                  </div>
                </div>
              </q-card-section>
            </template>
            <template v-if="bottomExpansion === 'integrations'">
              <q-card-section class="height-240">
                <contact-integrations :contact="contact"
                                      :no_title="true"
                                      v-show="expanded">
                </contact-integrations>
              </q-card-section>
            </template>
            <template v-if="bottomExpansion === 'dialpad'">
              <q-card-section class="height-445">
                <div class="d-flex flex-column justify-content-around h-100 pt-3 pb-3">
                  <div class="d-flex flex-column">
                    <b-form-input class="phone-digits"
                                  v-model="digits"
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
                <div class="d-flex flex-column justify-content-between w-100 pt-3 pb-3 pl-3 pr-3 h-100">
                  <div class="d-flex">
                    <communication-note class="flex-grow-1 h-100 phone-notes"
                                        ref="communicationNotes"
                                        :communication="dialer.communication"
                                        :no-auto-save="true"
                                        @notesChanged="storeNotes"
                                        @onUnsavedChanges="onCommunicationNotesUnsaved">
                    </communication-note>
                  </div>
                  <div class="d-flex">
                    <b-button variant="primary"
                              size="sm"
                              block
                              @click="saveNotes">
                      <span>Save Notes</span>
                    </b-button>
                  </div>
                </div>

              </q-card-section>
            </template>
            <template v-if="bottomExpansion === 'tags'">
              <q-card-section class="height-240 mx-2 px-3">
                <entity-tags data-testid="phone-communication-tags-multi-select"
                             button-text="Modify Tags"
                             entity="communication"
                             entity-type="contacts"
                             :entity-object="dialer.communication"
                             :category="TagCategories.CAT_COMMUNICATIONS"
                             :use-card="false"
                             :use-add-icon="true" />
              </q-card-section>
            </template>
            <template v-if="bottomExpansion === 'scripts'">
              <q-card-section class="height-445 overflow-hidden-y">
                <div class="d-flex flex-column justify-content-start w-100 pt-3 pl-3 pr-3">
                  <script-selector class="w-100"
                                   :communication="dialer.communication"
                                   v-model="scriptId"
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
                <div class="d-flex flex-column justify-content-between w-100 pt-3 pb-3 pl-3 pr-3 h-100">
                  <div class="d-flex w-100">
                    <q-list class="phone-radio-select w-100">
                      <q-item class="pl-0 pr-0"
                              tag="label"
                              dense>
                        <q-item-section avatar>
                          <q-radio val="user"
                                   color="primary"
                                   size="xs"
                                   dense
                                   v-model="add.mode">
                          </q-radio>
                        </q-item-section>
                        <q-item-section>
                          <template v-if="add.mode === 'user'">
                            <div class="d-inline-flex w-100">
                              <available-user-selector class="flex-grow-1"
                                                       ref="availableUserSelector"
                                                       :communication="dialer.communication"
                                                       v-model="add.userId"
                                                       @change="changeAddUser">
                              </available-user-selector>
                              <q-btn class="text-size-xxs ml-1"
                                     color="black"
                                     icon="refresh"
                                     flat
                                     round
                                     @click="getUsers">
                              </q-btn>
                            </div>
                          </template>
                          <template v-else>
                            <span class="text-rg text-grey-100">Add User</span>
                          </template>
                        </q-item-section>
                      </q-item>
                      <q-item tag="label"
                              class="pl-0 pr-0"
                              dense>
                        <q-item-section avatar>
                          <q-radio val="ring-group"
                                   color="primary"
                                   size="xs"
                                   dense
                                   v-model="add.mode">
                          </q-radio>
                        </q-item-section>
                        <q-item-section>
                          <template v-if="add.mode === 'ring-group'">
                            <ring-group-selector :genericMultiselect="false"
                                                 :isGenericSelectorStyle="true"
                                                 :clearable="true"
                                                 v-model="add.ringGroupId"
                                                 @change="changeAddRingGroup">
                            </ring-group-selector>
                          </template>
                          <template v-else>
                            <span class="text-rg text-grey-100">Add Ring Group</span>
                          </template>
                        </q-item-section>
                      </q-item>
                      <q-item tag="label"
                              class="pl-0 pr-0"
                              dense>
                        <q-item-section avatar>
                          <q-radio val="phone-number"
                                   color="primary"
                                   size="xs"
                                   dense
                                   v-model="add.mode">
                          </q-radio>
                        </q-item-section>
                        <q-item-section>
                          <template v-if="add.mode === 'phone-number'">
                            <q-input class="form-control-search form-control"
                                     placeholder="Enter phone number"
                                     borderless
                                     clearable
                                     dense
                                     v-model="add.phoneNumber"
                                     @input="changeAddPhoneNumber">
                            </q-input>
                          </template>
                          <template v-else>
                            <span class="text-rg text-grey-100">Add Phone Number</span>
                          </template>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </div>
                  <div class="d-flex flex-inline">
                    <div class="d-flex flex-grow-1">
                      <div class="d-flex flex-even pl-1 pr-1">
                        <b-button variant="outline-dark-primary"
                                  size="sm"
                                  block
                                  :loading="loadingAdd"
                                  :disabled="loadingAdd || !addValidated"
                                  @click="addParticipant">
                          <i class="material-icons-outlined">person_add_alt</i>
                          <span class="ml-2">Add</span>
                        </b-button>
                      </div>
                      <div class="d-flex flex-even pl-1 pr-1">
                        <b-button variant="outline-dark-primary"
                                  size="sm"
                                  block
                                  :loading="loadingIntroduce"
                                  :disabled="loadingIntroduce || !introduceValidated"
                                  @click="introduceParticipant">
                          <i class="material-icons-outlined">people</i>
                          <span class="ml-2">Introduce</span>
                        </b-button>
                      </div>
                    </div>
                    <b-button id="add-help"
                              class="ml-2 no-border p-0 flex-shrink-1"
                              variant="outline-dark"
                              size="sm">
                      <i class="material-icons-outlined">info</i>
                    </b-button>
                    <b-popover target="add-help"
                               placement="topleft"
                               triggers="hover focus">
                      <p>
                        <strong>Add:</strong> Adding a user
                        <br>
                        User immediately joins the conversation when he/she answers.
                      </p>
                      <p>
                        <strong>Introduce:</strong> Introducing contact to a user
                        <br>
                        Puts the contact on hold and dials the user. Once connected you speak with the user (privately) and then merge both parties using the merge button.
                      </p>
                    </b-popover>
                  </div>
                </div>
              </q-card-section>
            </template>
            <template v-if="bottomExpansion === 'transfer'">
              <q-card-section class="height-445">
                <div class="d-flex flex-column justify-content-between w-100 pt-3 pb-3 pl-3 pr-3 h-100">
                  <div class="d-flex w-100">
                    <q-list class="phone-radio-select w-100">
                      <q-item class="pl-0 pr-0"
                              tag="label"
                              dense>
                        <q-item-section avatar>
                          <q-radio val="user"
                                   color="primary"
                                   size="xs"
                                   dense
                                   v-model="transfer.mode">
                          </q-radio>
                        </q-item-section>
                        <q-item-section>
                          <template v-if="transfer.mode === 'user'">
                            <div class="d-inline-flex w-100">
                              <available-user-selector ref="availableUserSelector"
                                                       class="flex-grow-1"
                                                       :communication="dialer.communication"
                                                       v-model="transfer.userId"
                                                       @change="changeTransferUser">
                              </available-user-selector>
                              <q-btn class="text-size-xxs ml-1"
                                     color="black"
                                     icon="refresh"
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
                      <q-item class="pl-0 pr-0"
                              tag="label"
                              dense>
                        <q-item-section avatar>
                          <q-radio val="ring-group"
                                   color="primary"
                                   size="xs"
                                   dense
                                   v-model="transfer.mode">
                          </q-radio>
                        </q-item-section>
                        <q-item-section class="test">
                          <template v-if="transfer.mode === 'ring-group'">
                            <ring-group-selector :genericMultiselect="false"
                                                 :isGenericSelectorStyle="true"
                                                 :clearable="true"
                                                 v-model="transfer.ringGroupId"
                                                 @change="changeTransferRingGroup">
                            </ring-group-selector>
                          </template>
                          <template v-else>
                            <span class="text-rg text-grey-100">Transfer to Ring Group</span>
                          </template>
                        </q-item-section>
                      </q-item>
                      <q-item class="pl-0 pr-0"
                              tag="label"
                              dense>
                        <q-item-section avatar>
                          <q-radio val="phone-number"
                                   color="primary"
                                   size="xs"
                                   dense
                                   v-model="transfer.mode">
                          </q-radio>
                        </q-item-section>
                        <q-item-section>
                          <template v-if="transfer.mode === 'phone-number'">
                            <q-input class="form-control-search form-control"
                                     placeholder="Enter phone number"
                                     borderless
                                     clearable
                                     dense
                                     v-model="transfer.phoneNumber"
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
                    <b-button variant="primary"
                              size="sm"
                              block
                              :loading="loadingTransfer"
                              :disabled="loadingTransfer || !transferValidated"
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
                    <vm-drop-selector class="w-100"
                                      v-model="vmDropId"
                                      @change="changeVmDrop"/>
                  </div>
                  <div class="d-flex">
                    <b-button variant="primary"
                              size="sm"
                              block
                              :loading="loadingSendVmDrop"
                              :disabled="loadingSendVmDrop || !vmDropId"
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
                          @click="openExpansion('scripts')">
                    <scripts-icon :width="iconSizes.scripts.width"
                                  :height="iconSizes.scripts.height">
                    </scripts-icon>
                    <span>Scripts</span>
                  </button>
                  <button class="phone-buttons btn"
                          :disabled="isParkDisabled"
                          @click="parkCall">
                    <park-call-icon :width="iconSizes.parkCall.width"
                                    :height="iconSizes.parkCall.height">
                    </park-call-icon>
                    <span>Park Call</span>
                  </button>
                  <button class="phone-buttons btn"
                          @click="openContact">
                    <contact-icon :width="iconSizes.contact.width"
                                  :height="iconSizes.contact.height">
                    </contact-icon>
                    <span>Contact</span>
                  </button>
                  <button class="phone-buttons btn"
                          @click="openExpansion('integrations')">
                    <integrations-icon :width="iconSizes.integrations.width"
                                       :height="iconSizes.integrations.height">
                    </integrations-icon>
                    <span>Integrations</span>
                  </button>
                </div>
              </q-card-section>
            </template>
          </q-card>
        </q-expansion-item>
      </div>
    </template>
  </div>
</template>
<script>
import _ from 'lodash'
import { mapActions, mapState } from 'vuex'
import {
  communicationInfoMixin,
  notificationMixin,
  dispositionsMixin,
  agentMixin,
  dialerCommunicationMixin
} from 'src/plugins/mixins'
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
import IntegrationsIcon from 'components/icons/integrations-icon'
import VmDropIcon from 'components/icons/vm-drop-icon'
import CommunicationAudio from 'components/communication-audio'
import CommunicationNote from 'components/communication-note'
import CommunicationTags from 'components/generic-selectors/communication-tags'
import CallDispositionWrapper from 'components/generic-wrappers/call-disposition-wrapper'
import ContactDispositionWrapper from 'components/generic-wrappers/contact-disposition-wrapper'
import TemplateSelector from 'components/generic-selectors/template-selector'
import ParkCallIcon from 'components/icons/park-call-icon'
import ContactIcon from 'components/icons/contact-icon'
import ScriptSelector from 'components/generic-selectors/script-selector'
import VmDropSelector from 'components/generic-selectors/vm-drop-selector'
import RingGroupSelector from 'components/generic-selectors/ring-group-selector'
import AvailableUserSelector from 'components/generic-selectors/available-user-selector'
import ParticipantsIcon from 'components/icons/participants-icon'
import ReadyIcon from 'components/icons/ready-icon'
import DropParticipantIcon from 'components/icons/drop-participant-icon'
import WaitingIcon from 'components/icons/waiting-icon'
import MergeIcon from 'components/icons/merge-icon'
import * as CommunicationDirection from 'src/constants/communication-direction'
import * as CommunicationDispositionStatus from 'src/constants/communication-disposition-status'
import * as CommunicationStatus from 'src/constants/communication-status'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import * as CommunicationTypes from 'src/constants/communication-types'
import * as UploadedFileTypes from 'src/constants/uploaded-file-types'
import * as AnswerTypes from 'src/constants/answer-types'
import * as InboundCallRecordingModes from 'src/constants/inbound-call-recording-modes'
import * as OutboundCallRecordingModes from 'src/constants/outbound-call-recording-modes'
import { TAG_CATEGORIES as TagCategories } from 'src/constants/tag-categories'
import CopyIcon from 'components/icons/copy-icon'
import IgnoreCallIcon from 'components/icons/ignore-call-icon'
import MobileLiveCallBar from 'components/dialer/mobile-live-call-bar'
import DeviceSelector from 'components/generic-selectors/device-selector'
import ParkedCallIcon from 'components/icons/parked-call-icon'
import API from 'src/plugins/api/api'
import HubspotActivityTypeSelector from 'components/hubspot-activity-type-selector'
import EntityTags from 'components/generic-selectors/entity-tags'

export default {
  name: 'phone',

  components: {
    HubspotActivityTypeSelector,
    ParkedCallIcon,
    MobileLiveCallBar,
    IgnoreCallIcon,
    CopyIcon,
    MergeIcon,
    WaitingIcon,
    DropParticipantIcon,
    ReadyIcon,
    ParticipantsIcon,
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
    ContactIntegrations,
    DeviceSelector,
    EntityTags
  },

  mixins: [
    communicationInfoMixin,
    notificationMixin,
    dispositionsMixin,
    agentMixin,
    dialerCommunicationMixin
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
    },

    isMobile: {
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
      loadingCommunication: false,
      loadingDropThirdParty: false,
      loadingToggleRecordingStatus: false,
      loadingMerge: false,
      loadingHold: false,
      loadingUnhold: false,
      loadingPark: false,
      loadingTransfer: false,
      loadingAdd: false,
      loadingIntroduce: false,
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
      add: {
        introduce: false,
        mode: 'user',
        userId: null,
        ringGroupId: null,
        phoneNumber: ''
      },
      loadingPhone: false,
      communicationNotes: '',
      hasCommunicationNotesUnsavedChanges: false,
      phoneListeners: {},
      CommunicationDirection,
      CommunicationDispositionStatus,
      CommunicationStatus,
      CommunicationCurrentStatus,
      CommunicationTypes,
      UploadedFileTypes,
      TagCategories,
      callbackAction: false
    }
  },

  computed: {
    ...mapState([
      'dialer',
      'campaigns',
      'users',
      'warnings',
      'inputDevices',
      'outputDevices',
      'currentInputDevice',
      'currentOutputDevice',
      'shouldIntroduce',
      'addedParty',
      'showIncomingCallNotification',
      'sessionPhoneExpansion',
      'parkedCalls',
      'callFishingQueue'
    ]),

    ...mapState('cache', ['currentCompany']),

    isCallCompleted () {
      return ((this.dialer.communication && this.dialer.communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW) || ['HANGING_UP_CALL', 'CALL_DISCONNECTED', 'WRAP_UP'].includes(this.dialer.currentStatus))
    },

    isHangupDisabled () {
      return this.isCallCompleted
    },

    isAddDisabled () {
      return (
        !this.devMode &&
        (
          !this.dialer.communication ||
          this.isCallCompleted ||
          this.dialer.communication.in_cold_transfer ||
          (this.currentCompany && !this.currentCompany.conferencing_enabled) ||
          (this.dialer.communication.legc_uuid && [CommunicationStatus.STATUS_INPROGRESS_NEW, CommunicationStatus.STATUS_RINGING_NEW].includes(this.dialer.communication.legc_status)) ||
          (this.dialer.communication.legz_uuid && this.dialer.call.callSid === this.dialer.communication.legz_uuid)
        )
      ) || this.isBargingOrWhispering
    },

    isTransferDisabled () {
      return (
        !this.devMode &&
        (
          !this.dialer.communication ||
          this.isCallCompleted ||
          (this.dialer.communication.legc_uuid && this.dialer.communication.legc_status === CommunicationStatus.STATUS_INPROGRESS_NEW) ||
          (this.currentCompany && !this.currentCompany.conferencing_enabled) ||
          (this.dialer.communication.legc_uuid && [CommunicationStatus.STATUS_INPROGRESS_NEW, CommunicationStatus.STATUS_RINGING_NEW].includes(this.dialer.communication.legc_status)) ||
          (this.dialer.communication.legz_uuid && this.dialer.call.callSid === this.dialer.communication.legz_uuid)
        )
      ) || this.isBargingOrWhispering
    },

    isMoreDisabled () {
      return !this.devMode && this.isCallCompleted
    },

    isVmDropDisabled () {
      return !this.devMode && !this.isCallInProgressStatus
    },

    isHoldDisabled () {
      return (!this.dialer.communication ||
        this.loadingHold ||
        this.loadingUnhold ||
        this.isCallCompleted ||
        (this.currentCompany && !this.currentCompany.conferencing_enabled) ||
        (this.dialer.communication.legc_uuid && [CommunicationStatus.STATUS_INPROGRESS_NEW, CommunicationStatus.STATUS_RINGING_NEW].includes(this.dialer.communication.legc_status)) ||
        (this.dialer.communication.legz_uuid && this.dialer.call.callSid === this.dialer.communication.legz_uuid))
    },

    isParkDisabled () {
      return (
        _.isEmpty(this.dialer.communication) ||
        this.loadingPark ||
        this.isCallCompleted ||
        (!_.isEmpty(this.currentCompany) && !this.currentCompany.conferencing_enabled) ||
        (!_.isEmpty(this.dialer.communication.legc_uuid) && [CommunicationStatus.STATUS_INPROGRESS_NEW, CommunicationStatus.STATUS_RINGING_NEW].includes(this.dialer.communication.legc_status)) ||
        (!_.isEmpty(this.dialer.communication.legz_uuid) && this.dialer.call.callSid === this.dialer.communication.legz_uuid)
      ) || this.isBargingOrWhispering
    },

    isMuteDisabled () {
      return this.isCallCompleted
    },

    isRecordingDisabled () {
      return this.isCallCompleted || this.isBargingOrWhispering || this.isAccountForcedAlwaysRecordInbound || this.isAccountForcedAlwaysRecordOutbound
    },

    isCallAdded () {
      return (this.dialer.communication && this.dialer.communication.legc_uuid && this.dialer.communication.legc_status === CommunicationStatus.STATUS_INPROGRESS_NEW && !this.dialer.communication.in_cold_transfer && this.dialer.call.call_sid !== this.dialer.communication.legc_uuid && (!this.dialer.communication.legz_uuid || this.dialer.call.call_sid !== this.dialer.communication.legz_uuid))
    },

    isCallAdding () {
      return this.dialer.communication && this.dialer.communication.legc_uuid && this.dialer.communication.legc_status === CommunicationStatus.STATUS_RINGING_NEW
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

    addValidated () {
      if (this.add.mode === 'user' && this.add.userId) {
        return true
      }

      if (this.add.mode === 'ring-group' && this.add.ringGroupId) {
        return true
      }

      if (this.add.mode === 'phone-number' && this.add.phoneNumber && this.$options.filters.fixPhone(this.add.phoneNumber)) {
        return true
      }

      return false
    },

    introduceValidated () {
      if (this.add.mode === 'user' && this.add.userId) {
        return true
      }

      if (this.add.mode === 'ring-group' && this.add.ringGroupId) {
        return true
      }

      if (this.add.mode === 'phone-number' && this.add.phoneNumber && this.$options.filters.fixPhone(this.add.phoneNumber)) {
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
        case 'members':
          return 'Members'
        default:
          return ''
      }
    },

    phoneExpansionLabel () {
      return this.bottomExpansion === 'tags' ? 'Done' : 'Cancel'
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
      if (this.contact) {
        return this.contact.name || 'No Name'
      }

      const callFishingContactName = _.get(this.dialer.callFishing, 'contact.name', 'No Name')

      if (callFishingContactName) {
        return callFishingContactName
      }

      return 'No Name'
    },

    leadNumberRaw () {
      const leadNumber = _.get(this.dialer, 'communication.lead_number', null)
      return !leadNumber ? _.get(this.dialer, 'callFishing.communication.lead_number', null) : leadNumber
    },

    leadNumber () {
      return this.$options.filters.fixPhone(this.leadNumberRaw)
    },

    companyName () {
      const companyName = _.get(this.dialer, 'contact.company_name', '')
      return !companyName ? _.get(this.dialer, 'callFishing.contact.company_name', '') : companyName
    },

    contact () {
      const contact = this.dialer.contact
      return !contact ? _.get(this.dialer, 'callFishing.contact', null) : contact
    },

    shouldShow () {
      const callFishingCommunication = _.get(this.dialer, 'callFishing.communication', null)

      if (callFishingCommunication) {
        return true
      }

      if (this.dialer.call && this.dialer.call.direction === 'INCOMING' &&
        this.dialer.currentStatus === 'RECEIVED_CALL_INVITE' &&
        this.showIncomingCallNotification) {
        return false
      }

      if (['menu', 'wrap-up'].includes(this.screen)) {
        return true
      }

      return this.dialer && !_.isEmpty(this.dialer.communication)
    },

    iconSizes () {
      return {
        mute: {
          width: this.isMobile ? 26 : 16,
          height: this.isMobile ? 26 : 16
        },
        hold: {
          width: this.isMobile ? 26 : 16,
          height: this.isMobile ? 26 : 16
        },
        keypad: {
          width: this.isMobile ? 26 : 16,
          height: this.isMobile ? 26 : 16
        },
        recording: {
          width: this.isMobile ? 26 : 16,
          height: this.isMobile ? 26 : 16
        },
        notes: {
          width: this.isMobile ? 26 : 16,
          height: this.isMobile ? 26 : 16
        },
        tags: {
          width: this.isMobile ? 26 : 16,
          height: this.isMobile ? 26 : 16
        },
        vmdrop: {
          width: this.isMobile ? 26 : 18,
          height: this.isMobile ? 26 : 18
        },
        call: {
          width: this.isMobile ? 60 : 40,
          height: this.isMobile ? 60 : 40
        },
        add: {
          width: this.isMobile ? 26 : 16,
          height: this.isMobile ? 26 : 16
        },
        transfer: {
          width: this.isMobile ? 26 : 16,
          height: this.isMobile ? 26 : 16
        },
        more: {
          width: this.isMobile ? 26 : 16,
          height: this.isMobile ? 26 : 16
        },
        scripts: {
          width: this.isMobile ? 26 : 18,
          height: this.isMobile ? 26 : 18
        },
        parkCall: {
          width: this.isMobile ? 26 : 18,
          height: this.isMobile ? 26 : 18
        },
        contact: {
          width: this.isMobile ? 26 : 18,
          height: this.isMobile ? 26 : 18
        },
        integrations: {
          width: this.isMobile ? 26 : 18,
          height: this.isMobile ? 26 : 18
        }
      }
    },

    hasCallFishingCommunication () {
      return _.get(this.dialer, 'callFishing.communication', null) !== null
    },

    hasCallFishingContact () {
      return _.get(this.dialer, 'callFishing.contact', null) !== null
    },

    isPhoneBodyVisible () {
      return this.screen === 'call' &&
        (!_.isEmpty(this.dialer.call) ||
          !this.hasCallFishingCommunication)
    },

    isPhoneCTAVisible () {
      return (!_.isEmpty(this.dialer.call) &&
        this.dialer.call.direction === 'INCOMING') ||
        this.hasCallFishingCommunication
    },

    isHangupCallVisible () {
      return !_.isEmpty(this.dialer.call) &&
        this.dialer.call.direction === 'OUTGOING' &&
        !this.hasCallFishingCommunication
    },

    isOnPowerDialerSessionRoute () {
      return this.$route.meta.id === 'power-dialer-session'
    },

    isCallFishingCommunicationInParkedCalls () {
      if (_.isEmpty(this.parkedCalls)) {
        return false
      }

      const found = this.parkedCalls.find(parkedCall => parkedCall.id === this.dialer.callFishing.communication.id)

      return !_.isEmpty(found)
    },

    isIgnored () {
      if (_.isEmpty(this.callFishingQueue)) {
        return true
      }

      const found = this.callFishingQueue.find(item => item.communicationId === this.dialer.callFishing.communication.id)

      return _.isEmpty(found)
    },

    isDeclineCallVisible () {
      return this.dialer.call !== undefined ||
        !this.hasCallFishingCommunication
    },

    isIgnoreCallVisible () {
      return this.hasCallFishingCommunication &&
        !this.isCallFishingCommunicationInParkedCalls &&
        !this.isIgnored
    },

    isAnswerCallVisible () {
      return (this.dialer.call !== undefined &&
          !this.hasCallFishingCommunication) ||
        (this.hasCallFishingCommunication &&
          !this.isCallFishingCommunicationInParkedCalls)
    },

    isUnparkCallVisible () {
      return this.hasCallFishingCommunication &&
        this.isCallFishingCommunicationInParkedCalls
    },

    pauseRecordIconShow () {
      return (!this.isCallCompleted || this.devMode) &&
        this.dialer.recordingStatus === 'in-progress' &&
        this.dialer.communication && this.dialer.communication.should_record === true
    },

    phoneCtaClass () {
      const isOnlyAnswerCallVisible = !this.isDeclineCallVisible &&
        !this.isIgnoreCallVisible && this.isAnswerCallVisible
      const classValue = this.isUnparkCallVisible || isOnlyAnswerCallVisible
        ? 'justify-content-center'
        : 'justify-content-between'

      return [classValue]
    },

    hangupCallClass () {
      const classValue = this.dialer.communication.current_status2 !== CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW
        ? 'ripple'
        : ''

      return [ classValue ]
    },

    isIntroduceDisabled () {
      return this.loadingMerge || !this.dialer.communication.legc_status ||
        this.dialer.communication.legc_status !== CommunicationStatus.STATUS_INPROGRESS_NEW
    },

    isDisabledPhoneButtons () {
      return this.isRecordingDisabled || this.loadingToggleRecordingStatus ||
        this.dialer.communication.should_record === false
    },

    isPhoneExpansionAvailable () {
      return (this.devMode || !this.isCallCompleted) &&
        (this.contact || this.hasCallFishingCommunication) && this.expansionEnabled
    },

    isAccountForcedAlwaysRecordInbound () {
      return this.dialer.communication.direction === CommunicationDirection.INBOUND &&
        this.currentCompany.inbound_call_recording_mode === InboundCallRecordingModes.INBOUND_CALL_RECORDING_MODE_ALWAYS
    },

    isAccountForcedAlwaysRecordOutbound () {
      return this.dialer.communication.direction === CommunicationDirection.OUTBOUND &&
        this.currentCompany.outbound_call_recording_mode === OutboundCallRecordingModes.OUTBOUND_CALL_RECORDING_MODE_ALWAYS
    }
  },

  created () {
    this.phoneListeners.showLoadingPhone = () => {
      // Disable phone visibility on power dialer sessions
      this.isVisible = this.$route.meta.id !== 'power-dialer-session'
      this.loadingPhone = true
      this.$emit('onPhoneVisible', true)
    }

    this.phoneListeners.togglePhone = () => {
      this.togglePhone()
    }

    this.phoneListeners.showPhone = () => {
      this.isVisible = true
      this.$emit('onPhoneVisible', true)
    }

    this.phoneListeners.hidePhone = () => {
      this.isVisible = false
    }

    this.phoneListeners.callDisconnected = (communicationId) => {
      if (this.hasCommunicationNotesUnsavedChanges) {
        this.$axios.patch(`/api/v1/communication/${communicationId}`, {
          notes: this.communicationNotes
        })
      }
    }

    this.$VueEvent.listen('showLoadingPhone', this.phoneListeners.showLoadingPhone)
    this.$VueEvent.listen('togglePhone', this.phoneListeners.togglePhone)
    this.$VueEvent.listen('showPhone', this.phoneListeners.showPhone)
    this.$VueEvent.listen('hidePhone', this.phoneListeners.hidePhone)
    this.$VueEvent.listen('callDisconnected', this.phoneListeners.callDisconnected)
  },

  mounted () {
    this.setupDraggable()
    this.setupContactLocalTime()
    // Disable phone visibility on power dialer sessions
    this.isVisible = this.$route.meta.id !== 'power-dialer-session'
    this.showLocalTime = true

    if (this.dialer.currentStatus === 'WRAP_UP') {
      this.changeScreen('wrap-up')
    }
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
      const contact = !this.contact ? _.get(this.dialer, 'callFishing.contact', null) : this.contact

      if (contact) {
        this.getContactLocalTime()
        this.$options.localTimeInterval = setInterval(this.getContactLocalTime, 60 * 1000)
      }
    },

    hideLocalTime () {
      this.showLocalTime = false
    },

    getContactLocalTime () {
      const contact = !this.contact ? _.get(this.dialer, 'callFishing.contact', null) : this.contact

      if (contact && contact.timezone) {
        this.currentLocalTime = this.$moment.utc().tz(contact.timezone).format('h:mm a')
      }
    },

    goToContact () {
      if (this.contact) {
        this.$router.push({
          name: 'Contact',
          params: {
            id: this.contact.id
          }
        }).catch(err => {
          console.log(err)
        })
      }
    },

    copyPhoneNumber (phoneNumber) {
      this.$copyToClipboard(phoneNumber)
      this.$generalNotification('Phone number copied to clipboard.')
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

      if (this.hasCallFishingCommunication) {
        this.$VueEvent.fire('makeCall', {
          currentNumber: 'call:' + _.get(this.dialer, 'callFishing.communication.id', null),
          outboundCampaignId: _.get(this.dialer, 'callFishing.communication.campaign_id', null),
          contactName: _.get(this.dialer, 'callFishing.contact.name', null),
          companyName: _.get(this.dialer, 'callFishing.contact.company_name', null),
          contactId: _.get(this.dialer, 'callFishing.communication.contact_id', null)
        })

        this.processRemoveFromNotification(this.dialer.callFishing.communication)
      }

      this.changeScreen('menu')
    },

    rejectCall () {
      this.$VueEvent.fire('rejectCall')

      if (this.dialer.callFishing) {
        this.processRemoveFromNotification(this.dialer.callFishing.communication)
      }

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
      this.$options.holdIntervalCount = 0

      this.$options.holdInterval = setInterval(() => {
        if (this.loadingHold && this.dialer.isHeld) {
          this.loadingHold = false
          clearInterval(this.$options.holdInterval)
        }

        if (this.loadingUnhold && !this.dialer.isHeld) {
          this.loadingUnhold = false
          clearInterval(this.$options.holdInterval)
        }

        this.$options.holdIntervalCount++

        if (this.$options.holdIntervalCount >= 120) {
          clearInterval(this.$options.holdInterval)
        }
      }, 500)
    },

    openExpansion (mode) {
      if (mode === 'transfer') {
        this.resetTransfer()
      }

      this.expansionEnabled = true
      this.bottomExpansion = mode

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

    unparkCommunication () {
      if (!this.hasCallFishingCommunication) {
        return
      }

      this.$VueEvent.fire('unparkCall', this.dialer.callFishing.communication)
    },

    saveAndResetExpansion ($event) {
      if ($event) {
        $event.stopPropagation()
        $event.preventDefault()
      }

      this.expansionEnabled = false
      this.expanded = false
      this.resetAdd()
      this.resetTransfer()
      this.$VueEvent.fire('phoneExpansionReset')
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

        return
      }

      this.sendDigit('0')
    },

    sendDigit (digit) {
      this.digits += digit.toString()
      this.$VueEvent.fire('sendDigit', digit)
    },

    getCampaign (id) {
      if (!id) {
        return null
      }

      // reference the campaign object in communication if it has
      if (this.dialer.communication?.campaign) {
        return this.dialer.communication.campaign
      }

      if (this?.communication?.campaign) {
        return this.communication.campaign
      }

      const found = this.campaigns.find(campaign => campaign.id === id)

      if (found) {
        return found
      }

      return null
    },

    togglePhone () {
      this.isVisible = !this.isVisible
      this.$emit('onPhoneVisible', true)
    },

    openPhone () {
      this.isVisible = this.$route.meta.id !== 'power-dialer-session'
      // this.isVisible = true
      this.$emit('onPhoneVisible', true)
    },

    closePhone () {
      this.isVisible = false
      this.$emit('onPhoneVisible', false)
    },

    endWrapUp (type = 'finish') {
      if (this.$route.name === 'Power Dialer') {
        this.$VueEvent.fire('endWrapUpPDSession')
      }

      this.$VueEvent.fire('endWrapUp')

      this.callbackAction = type === 'callback'

      this.$emit('onPhoneVisible', false)
    },

    makeCall () {
      if (!this.dialer.communication) {
        return
      }

      const data = {
        currentNumber: this.$options.filters.fixPhone(this.dialer.communication.lead_number),
        outboundCampaignId: this.dialer.communication.campaign_id,
        contactName: this.contactName,
        companyName: (this.contact) ? this.contact.company_name : '',
        contactId: this.dialer.communication.contact_id
      }

      this.endWrapUp('callback')

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
      const newLeft = this.$refs.phone.offsetLeft - this.pos1
      const newTop = this.$refs.phone.offsetTop - this.pos2

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

    setInputDevice (inputDevice) {
      console.log('device', inputDevice)
      this.$VueEvent.fire('setInputDevice', inputDevice)
    },

    setOutputDevice (outputDevice) {
      console.log('device', outputDevice)
      this.$VueEvent.fire('setOutputDevice', outputDevice)
    },

    testOutputDevice () {
      this.$VueEvent.fire('testOutputDevice', this.currentOutputDevice)
    },

    forceRefreshCommunication ($event) {
      this.$VueEvent.fire('initializeSettings')
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

      API.V1.dialer.sendVmDrop({
        communication_id: this.dialer.communication.id,
        file_name: this.vmDrop.uploaded_file.uuid,
        name: this.vmDrop.name
      }).then(() => {
        this.vmDrop = null
        this.vmDropId = null
        this.loadingSendVmDrop = false
        this.saveAndResetExpansion($event)
        this.$generalNotification('Voicemail left')
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
        this.$generalNotification('Message sent')
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

    resetAdd () {
      this.add.introduce = false
      this.add.userId = null
      this.add.ringGroupId = null
      this.add.phoneNumber = ''
      this.add.mode = 'user'
    },

    changeAddUser (userId) {
      this.add.phoneNumber = ''
      this.add.ringGroupId = null
      this.add.userId = userId
    },

    changeAddRingGroup (ringGroupId) {
      this.add.phoneNumber = ''
      this.add.userId = null
      this.add.ringGroupId = ringGroupId
    },

    changeAddPhoneNumber () {
      this.add.userId = null
      this.ringGroupId = null
    },

    getUsers () {
      this.add.userId = null
      this.transfer.userId = null

      if (this.$refs.availableUserSelector) {
        this.$refs.availableUserSelector.getUsers()
      }
    },

    transferCall ($event) {
      this.loadingTransfer = true
      this.$VueEvent.fire('transferCall', this.transfer)
      this.resetTransfer()
      this.saveAndResetExpansion($event)

      setTimeout(() => {
        this.loadingTransfer = false
      }, 1000)
    },

    addParticipant ($event) {
      this.loadingAdd = true
      this.$VueEvent.fire('addParticipant', this.add)
      this.resetAdd()
      this.saveAndResetExpansion($event)

      setTimeout(() => {
        this.loadingAdd = false
      }, 1000)
    },

    introduceParticipant ($event) {
      this.loadingIntroduce = true
      this.add.introduce = true
      this.$VueEvent.fire('addParticipant', this.add)
      this.resetAdd()
      this.saveAndResetExpansion($event)

      setTimeout(() => {
        this.loadingIntroduce = false
      }, 1000)
    },

    dropThirdParty () {
      this.loadingDropThirdParty = true
      this.$VueEvent.fire('dropThirdParty')

      setTimeout(() => {
        this.loadingDropThirdParty = false
      }, 1000)
    },

    mergeCalls () {
      this.loadingMerge = true
      this.$VueEvent.fire('mergeCalls')

      setTimeout(() => {
        this.loadingMerge = false
      }, 1000)
    },

    saveNotes () {
      if (this.$refs.communicationNotes) {
        this.$refs.communicationNotes.saveNote()
      }
    },

    getLabel (user) {
      if (!user) {
        return
      }

      switch (user.answer_by) {
        case AnswerTypes.BY_PHONE_NUMBER:
          return 'Phone Number (' + user.phone_number + ')'
        case AnswerTypes.BY_BROWSER:
          return 'Apps'
        case AnswerTypes.BY_IP_PHONE:
          return 'SIP (IP Phone)'
        case AnswerTypes.BY_NONE:
          return 'Will Not Answer'
      }
    },

    changeScreen (screen) {
      // don't go from wrap-up to menu (edge case)
      if (this.screen === 'wrap_up' && screen === 'menu') {
        return
      }

      this.screen = screen
    },

    storeNotes (notes) {
      this.communicationNotes = notes
    },

    onCommunicationNotesUnsaved (value) {
      this.hasCommunicationNotesUnsavedChanges = value
    },

    ...mapActions([
      'setDialerContact',
      'setDialerContactTags'
    ])
  },

  watch: {
    shouldShow () {
      this.loadingCommunication = false
      this.loadingDropThirdParty = false
      this.loadingToggleRecordingStatus = false
      this.loadingMerge = false
      this.loadingHold = false
      this.loadingUnhold = false
      this.loadingPark = false
      this.loadingTransfer = false
      this.loadingAdd = false
      this.loadingIntroduce = false
      this.setupDraggable()
      this.setupContactLocalTime()
      this.resetBottomExpansion()

      if (this.dialer.currentStatus === 'WRAP_UP') {
        this.changeScreen('wrap-up')
      } else {
        this.changeScreen('call')
      }

      this.digits = ''
      this.loadingPhone = false

      if (!this.shouldShow) {
        this.$emit('onPhoneVisible', false)

        // emit the callCompleted event to display a message to close the widget.
        // only emit the event if is_widget=true and the finish button is clicked.
        if (this.is_widget && !this.callbackAction) {
          this.$emit('callCompleted')
        }

        return
      }

      this.$emit('onPhoneVisible', true)
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
          this.changeScreen('menu')
        }
      },
      deep: true
    },

    'dialer.currentStatus': function (value) {
      switch (value) {
        case 'READY':
          this.changeScreen('call')
          this.$emit('onPhoneVisible', false)
          break
        case 'OFFLINE':
          this.changeScreen('call')
          break
        case 'RECEIVED_CALL_INVITE':
          this.changeScreen('call')
          break
        case 'INVITE_CANCELLED':
          this.changeScreen('call')
          break
        case 'WRAP_UP':
          this.changeScreen('wrap-up')
          this.resetBottomExpansion()
          break
        case 'GENERATING_TOKEN':
          this.changeScreen('call')
          this.closePhone()
          break
        case 'TOKEN_GENERATED':
          this.changeScreen('call')
          this.closePhone()
          break
        case 'MAKING_CALL':
          this.changeScreen('call')
          this.loadingPhone = true
          this.$emit('onPhoneVisible', true)
          return
        case 'ANSWERING_CALL':
          this.changeScreen('call')
          this.loadingPhone = true
          this.$emit('onPhoneVisible', true)
          return
        case 'REJECTING_CALL':
          this.changeScreen('call')
          break
        case 'CALL_CONNECTED':
          if (this.dialer.call && this.dialer.call.direction === 'INCOMING') {
            this.changeScreen('menu')
            this.loadingPhone = false
          } else if (this.dialer.call && this.dialer.call.direction === 'OUTGOING') {
            setTimeout(() => {
              if (this.screen !== 'wrap-up') {
                this.changeScreen('menu')
                this.loadingPhone = false
              }
            }, 5000)
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

      if (!['MAKING_CALL', 'ANSWERING_CALL', 'CALL_CONNECTED'].includes(value)) {
        this.loadingPhone = false
      }
    },

    'dialer.contact': function () {
      this.setupContactLocalTime()
      this.vmDropId = null
    },

    isCallCompleted () {
      this.resetBottomExpansion()
      this.expansionEnabled = false
    },

    sessionPhoneExpansion (value) {
      if (['add', 'dialpad', 'transfer'].includes(value)) {
        this.openExpansion(value)
      }
    }
  },

  beforeDestroy () {
    window.removeEventListener('resize', this.resizeHandler)
    this.$VueEvent.stop('showLoadingPhone', this.phoneListeners.showLoadingPhone)
    this.$VueEvent.stop('togglePhone', this.phoneListeners.togglePhone)
    this.$VueEvent.stop('showPhone', this.phoneListeners.showPhone)
    this.$VueEvent.stop('hidePhone', this.phoneListeners.hidePhone)
    this.$VueEvent.stop('callDisconnected', this.phoneListeners.callDisconnected)
    this.clearDialerCallFishing()
    clearInterval(this.$options.localTimeInterval)
    clearInterval(this.$options.holdInterval)
  }
}
</script>
