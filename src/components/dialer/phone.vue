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
                        :menu-offset="[4, 16]"
                        class="tab-dropdown no-arrow mr-2"
                        ref="menu"
                        auto-close
                        flat>
          <template v-slot:label>
            <q-btn icon="img:app-icons/dialer/phone_settings.svg"
                   size="12px"
                   class="icon-btn auto-size height-12"
                   padding="none"
                   flat>
            </q-btn>
          </template>

          <q-list class="tab-dropdown-list no-select">
          </q-list>
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
      <div class="phone-notice d-flex flex-column align-items-center"
           v-if="dialer.contact">
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
          <span class="text-size-xs">It's {{ contact_local_time }} in the timezone of the person you are calling</span>
          <template v-slot:action>
            <q-btn color="white"
                   icon="o_cancel"
                   class="text-size-rg"
                   padding="none"
                   flat
                   round>
            </q-btn>
          </template>
        </q-banner>
      </div>
      <div class="phone-info d-flex flex-column align-items-center">
        <person-icon></person-icon>

        <div class="text-white text-center">
          <q-item-label class="text-size-xxl _600 mt-2"
                        v-if="dialer.contact">
            {{ dialer.contact.name | truncate(15) }}
          </q-item-label>
          <q-item-label class="text-size-sm _400 mt-1"
                        v-if="dialer.communication">
            {{ dialer.communication.lead_number | fixPhone }}
          </q-item-label>
          <q-item-label class="text-size-sm _400 mt-1"
                        v-if="dialer.contact && dialer.contact.company_name">
            {{ dialer.contact.company_name }}
          </q-item-label>
        </div>
      </div>
      <div class="phone-status d-flex justify-content-center">
        <span v-if="dialer.currentStatus === 'MAKING_CALL'">Calling...</span>
      </div>
      <div class="phone-cta">
        <div class="d-flex flex-row justify-content-between"
             v-if="dialer.call.direction === 'INCOMING'">
          <div class="d-flex flex-column align-items-center">
            <q-btn class="height-52"
                   ripple
                   round
                   no-caps>
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
                   no-caps>
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
                 :class="[ dialer.currentStatus === 'MAKING_CALL' ? 'ripple' : '']"
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
    </div>
    <div class="phone-integrations d-flex">
      <q-expansion-item class="shadow-1 overflow-hidden w-100"
                        style="border-radius: 12px"
                        label="Integrations"
                        header-class="text-sm bg-white text-center"
                        expand-icon-class="text-grey-100 ml-3"
                        switch-toggle-side
                        dense>
        <q-card>
          <q-card-section>
            <span>test</span>
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

export default {
  name: 'phone',

  components: { PersonIcon, AcceptCallIcon, CancelCallIcon },

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
      contact_local_time: null
    }
  },

  computed: {
    ...mapState(['currentCompany', 'dialer', 'campaigns', 'users', 'warnings']),

    signalStrength () {
      return 100 - (this.warnings.length * 25)
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
  },

  methods: {
    setupDraggable () {
      if (!this.is_widget && this.shouldShow) {
        setTimeout(() => {
          window.addEventListener('resize', this.resizeHandler)
          this.dragElement()
        }, 100)
      }
    },

    setupContactLocalTime () {
      if (this.dialer.contact) {
        this.getContactLocalTime()
        this.$options.local_time_interval = setInterval(this.getContactLocalTime, 60 * 1000)
      }
    },

    getContactLocalTime () {
      if (this.dialer.contact && this.dialer.contact.timezone) {
        this.contact_local_time = this.$moment.utc().tz(this.dialer.contact.timezone).format('h:mm a')
      }
    },

    hangupCall ($event) {
      $event.stopPropagation()
      $event.preventDefault()
      this.$VueEvent.fire('hangupCall')
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
    clearInterval(this.$options.local_time_interval)
  }
}
</script>
