<template>
  <div :class="[ isVisible ? '' : 'invisible' ]"
       class="phone"
       ref="phone"
       v-if="shouldShow">
    <div class="phone-header grabbable d-flex justify-content-between align-items-center"
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

  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'phone',

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
      isVisible: true
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

  beforeDestroy () {
    window.removeEventListener('resize', this.resizeHandler)
    this.$VueEvent.stop('togglePhone')
  },

  watch: {
    shouldShow () {
      this.setupDraggable()
    }
  }
}
</script>
