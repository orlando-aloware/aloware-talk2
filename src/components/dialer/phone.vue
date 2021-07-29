<template>
  <div :class="[ isVisible ? '' : 'invisible' ]"
       class="phone d-flex flex-column"
       ref="phone"
       v-if="shouldShow">
    <div class="phone-header d-flex grabbable d-flex justify-content-between align-items-center"
         ref="phoneHeader">
      <div class="d-flex flex-row text-size-rg _500 text-white width-55">
        <span v-if="dialer.timer">{{ dialer.timer }}</span>
        <span v-else-if="dialer.wrapUpTimer">{{ dialer.wrapUpTimer }}</span>
        <span v-else>
          0:00
        </span>
      </div>
      <div class="d-flex flex-row text-xs text-white"
           v-if="getCampaign(dialer.communication.campaign_id)">
        {{ getCampaign(dialer.communication.campaign_id).name | truncate(15) }}
      </div>
      <div class="d-flex flex-row width-55">
        <ul id="signal-strength"
            class="mr-2">
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

            <button class="btn btn-link text-size-sm _400 text-grey-100 p-0 mt-2"
                    @click="forceRefreshCommunication">
              <i class="fas fa-redo"></i>
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
      <template v-if="dialer.communication.current_status2 !== CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW">
        <div class="phone-notice d-flex flex-column align-items-center"
             v-if="dialer.contact && dialer.call.direction === 'OUTGOING' && showLocalTime">
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
               v-if="dialer.call.direction === 'INCOMING'">
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
               v-if="dialer.call.direction === 'OUTGOING'">
            <q-btn :disable="dialer.currentStatus === 'MAKING_CALL'"
                   :class="[ dialer.communication.current_status2 !== CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW ? 'ripple' : '']"
                   class="height-52"
                   ripple
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
      <template v-else>

      </template>
    </div>
    <div class="phone-integrations d-flex"
         v-if="dialer.contact">
      <q-expansion-item class="shadow-1 overflow-hidden w-100"
                        style="border-radius: 12px"
                        label="Integrations"
                        header-class="text-sm bg-white text-center"
                        expand-icon-class="text-grey-100 ml-3"
                        switch-toggle-side
                        dense>
        <q-card>
          <q-card-section class="height-200">
            <contact-integrations :contact="dialer.contact"
                                  :no_title="true">
            </contact-integrations>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import CancelCallIcon from 'components/icons/cancel-call-icon'
import AcceptCallIcon from 'components/icons/accept-call-icon'
import PersonIcon from 'components/icons/person-icon'
import ContactIntegrations from 'components/contacts/contact-integrations'
import * as CommunicationDirection from 'src/constants/communication-direction'
import * as CommunicationDispositionStatus from 'src/constants/communication-disposition-status'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import * as CommunicationTypes from 'src/constants/communication-types'

export default {
  name: 'phone',

  components: { PersonIcon, AcceptCallIcon, CancelCallIcon, ContactIntegrations },

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
      CommunicationDirection,
      CommunicationDispositionStatus,
      CommunicationCurrentStatus,
      CommunicationTypes
    }
  },

  computed: {
    ...mapState(['currentCompany', 'dialer', 'campaigns', 'users', 'warnings', 'inputDevices', 'outputDevices', 'currentInputDevice', 'currentOutputDevice']),

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

    hangupCall () {
      this.$VueEvent.fire('hangupCall')
    },

    answerCall () {
      this.$VueEvent.fire('answerCall')
    },

    rejectCall () {
      this.$VueEvent.fire('rejectCall')
      this.closePhone()
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
    }
  },

  watch: {
    shouldShow () {
      this.setupDraggable()
      this.setupContactLocalTime()
    },

    'dialer.contact': function () {
      this.setupContactLocalTime()
    }
  },

  beforeDestroy () {
    window.removeEventListener('resize', this.resizeHandler)
    this.$VueEvent.stop('togglePhone')
    clearInterval(this.$options.localTimeInterval)
  }
}
</script>
