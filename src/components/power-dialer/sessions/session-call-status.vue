<template>
  <q-card flat :disabled="sessionLoader || hasDefaultContact">
    <div v-show="!hasDefaultContact" class="t-menu-2 no-border">
      <div class="d-flex align-items-center pt-2 pb-0">
        <div class="font-weight-bold pl-3 flex-grow-1">
          <q-chip color="grey-50" class="p-0">
            <div class="text-15 text-lowercase text-capitalize px-2">
              {{ timerCount > 0 ? 'Will call in' : 'In a call with' }}
              <span
                class="text-weight-bold text-grey-7 text-lowercase"
                v-if="timerCount > 0">
                {{ timerCount }}s
              </span>
            </div>
          </q-chip>
        </div>
        <q-btn
          @click="toggleHold = !toggleHold"
          no-wrap outline no-caps size="sm" color="grey-4" class="sessions-button free-width mx-1">
          <UnholdIcon v-if="toggleHold" class="mr-2" color="#F2994A" />
          <PauseIcon v-else class="mr-2" color="#62666E" />
          <div class="text-body2 text-black">
            {{ toggleHold ? 'Unhold' : 'Hold' }}
          </div>
        </q-btn>
        <q-btn
          @click="nextContact"
          no-wrap unelevated no-caps
          size="sm" color="red-7"
          class="sessions-button free-width mx-1">
          <CallDropIcon class="mr-2" color="white" />
          <div class="text-body2">Next</div>
        </q-btn>
        <b-dropdown
          text="..."
          no-caret
          right size="sm"
          variant="white"
          class="m-1 b-compact-dropdown-button text-bold dropdown-white contacts-options-dropdown">
          <template #button-content>
            <i class="fa fa-ellipsis-h"></i>
          </template>
          <b-dropdown-item href="#">
            Option 1
          </b-dropdown-item>
          <b-dropdown-item href="#">
            Option 2
          </b-dropdown-item>
          <b-dropdown-item href="#">
            Option 3
          </b-dropdown-item>
        </b-dropdown>
      </div>
      <div class="d-flex align-items-center p-0">
        <div class="text-18 font-weight-bold pl-3 pt-2 flex-grow-1">
          {{ contact.name || '' }}
          <span class="text-15 text-subtitle1">
            {{ contact.phone_number || '' | fixPhone('NATIONAL', true) }}
          </span>
        </div>
      </div>
      <div class="d-flex align-items-center p-0">
        <div class="text-14 pl-3 text-subtitle1 text-capitalize">
          {{ companyName }}
          <span
            v-if="contact.company_name"
            class="text-13 text-subtitle2 text-grey"> | {{ contact.company_name }}</span>
        </div>
      </div>
      <div class="d-flex align-items-center p-0">
        <div class="flex-grow-1 text-14 text-subtitle1 text-capitaliz pl-3 py-0">
          <DropIcon
            v-if="address"
            width="18px"
            height="18px"
            class="mr-0 py-0"
            style="position:relative;top:-2px;" />
          {{ address }} - {{ contact.created_at || '' | fixTime }}
        </div>
        <q-btn
          @click="toggleMute = !toggleMute"
          no-wrap outline no-caps size="sm" color="grey-4"
          class="sessions-button free-width mx-1">
          <MuteIcon height="13px" class="mr-2" color="#62666E" />
          <div class="text-body2 text-black">
            {{ toggleMute ? 'Unmute' : 'Mute' }}
          </div>
        </q-btn>
        <q-btn
          @click="toggleRecording = !toggleRecording"
          no-wrap outline no-caps size="sm" color="grey-4" class="sessions-button free-width mx-1">
          <StopIcon v-if="toggleRecording" class="mr-2" color="#62666E" />
          <RecordIcon v-else class="mr-2" color="red" />
          <div class="text-body2 text-black">
            {{ toggleRecording ? 'Stop Rec.' : 'Record' }}
          </div>
        </q-btn>
      </div>
      <div class="d-flex align-items-center p-0 pt-2 pb-2">
        <div class="flex-grow-1 text-16 text-capitalize pl-3 text-weight-normal">
          {{ stats.group }}
          <span class="text-subtitle2 text-grey"></span>
          <div class="text-10 pt-1">
            <HeadphoneIcon width="12px" height="12px" class="mr-0 py-0" style="position:relative;top:-2px;" />
            {{ stats.line }}
          </div>
        </div>
        <q-btn
          @click="togglePause = !togglePause"
          :color="`${togglePause ? 'red-3' : 'grey-4'}`"
          unelevated outline
          no-wrap no-caps size="sm"
          :class="`${togglePause ? 'bg-btn-red' : ''} sessions-button free-width mx-1`">
          <PauseIcon class="mr-2" color="#62666E" />
          <div class="text-body2 text-black">
            {{ togglePause ? 'Pausing Session' : 'Pause Session' }}
          </div>
        </q-btn>
        <q-btn no-wrap outline no-caps size="sm" color="grey-4" class="sessions-button free-width mx-1">
          <EndCallIcon class="mr-2" color="#62666E" />
          <div class="text-body2 text-black">End Session</div>
        </q-btn>
      </div>
    </div>
  </q-card>
</template>

<script>

import { mapGetters, mapActions, mapMutations } from 'vuex'
import { mapFields } from 'vuex-map-fields'
import DropIcon from 'components/icons/drop-location-icon'
import HeadphoneIcon from 'components/icons/headphone-icon'
import PauseIcon from 'components/icons/pause-icon-2'
import UnholdIcon from 'components/icons/pause-icon-3'
import CallDropIcon from 'components/icons/call-drop-icon'
import StopIcon from 'components/icons/stop-icon'
import EndCallIcon from 'components/icons/stop-icon-2'
import RecordIcon from 'components/icons/record-icon'
import MuteIcon from 'components/icons/mute-icon'

export default {
  name: 'SessionCallStatus',
  components: {
    DropIcon,
    HeadphoneIcon,
    PauseIcon,
    UnholdIcon,
    CallDropIcon,
    StopIcon,
    EndCallIcon,
    RecordIcon,
    MuteIcon
  },
  computed: {
    ...mapGetters('powerDialer', [
      'powerDialerListItems',
      'sessionLoader',
      'sessionSettings'
    ]),
    ...mapGetters('contacts', [
      'contact',
      'listItems',
      'selectedList'
    ]),
    ...mapFields('powerDialer', [
      'activeTask'
    ]),
    address () {
      if (this.contact?.cnam_city && !this.contact?.cnam_state) {
        return `${this.contact?.cnam_city}`
      } else if (!this.contact?.cnam_city && this.contact?.cnam_state) {
        return `${this.contact?.cnam_state}`
      } else {
        return `${this.contact?.cnam_city}, ${this.contact?.cnam_state}`
      }
    },
    listObject () {
      return this.listItems[this.selectedList?.id]
    },
    list () {
      return this.listObject.data || []
    },
    companyName () {
      return this.contact?.company?.name || ''
    },
    keyIndex () {
      let keyCtr = 0
      this.list.forEach((item, key) => {
        if (item?.id === this.contact?.id) {
          keyCtr = key
        }
      })
      if (keyCtr + 1 < this.list.length) {
        return ++keyCtr
      }
      return keyCtr
    },
    hasDefaultContact () {
      if (this.contact?.id) {
        return false
      }
      return true
    },
    togglePause: {
      get () {
        return this.statuses.pause
      },
      set (val) {
        this.statuses.pause = val
      }
    },
    toggleRecording: {
      get () {
        return this.statuses.recording
      },
      set (val) {
        this.statuses.recording = val
      }
    },
    toggleHold: {
      get () {
        return this.statuses.hold
      },
      set (val) {
        this.statuses.hold = val
      }
    },
    toggleMute: {
      get () {
        return this.statuses.mute
      },
      set (val) {
        this.statuses.mute = val
      }
    }
  },
  mounted () {
    this.TOGGLE_SESSION_LOADER(false)
    this.timerCount = this.sessionSettings.warmup_period_in_seconds
    // setTimeout(() => {
    //   this.makeACall()
    // }, this.timerCount)
  },
  methods: {
    ...mapActions('powerDialer', [
      'getContact'
    ]),
    ...mapMutations('powerDialer', [
      'TOGGLE_SESSION_LOADER'
    ]),
    async nextContact () {
      this.TOGGLE_SESSION_LOADER(true)
      this.activeTask = this.list[this.keyIndex]
      await this.getContact({ id: this.list[this.keyIndex].id })
      this.TOGGLE_SESSION_LOADER(false)
      // this.makeACall()
    },
    async makeACall () {
      let data = {
        currentNumber: this.$options.filters.fixPhone(`power_dialer_task:${this.activeTask?.contact_list_item_id}`), // we know this already based on the list (Required)
        outboundCampaignId: this.sessionSettings.campaign_id, // this.session.campaignId, // ID of the line that you are calling from (Required)
        contactName: `${this.activeTask?.first_name} ${this.activeTask?.last_name}`, // this.contactListItem.name, // the name of the contact that you are calling (Optional but it's best to have it)
        companyName: this.activeTask?.company_name, // this.contactListItem.company_name, // the name of the company of the contact (Optional but it's best to have it)
        contactId: this.activeTask?.id // this.contactListItem.contact_id // the ID of the contact (Optional but it's best to have it)
      }
      // console.log(' %c Making a call from --> ', 'background: #000; color: #fff000;', data)
      this.$VueEvent.fire('makeCall', data)
    }
  },
  watch: {
    activeTask (val) {
      setTimeout(() => {
        this.timerCount = this.sessionSettings.warmup_period_in_seconds
      }, this.timerCount)
    },
    timerCount: {
      async handler (value) {
        if (value > 0) {
          setTimeout(() => {
            this.timerCount--
          }, 1000)
        } else if (value === 0) {
          await this.makeACall()
        }
      },
      deep: true
      // immediate: true // This ensures the watcher is triggered upon creation
    }
  },
  data () {
    return {
      timerCount: 0,
      loading: false,
      statuses: {
        pause: false,
        end: false,
        recording: false,
        hold: false,
        next: false,
        mute: false
      },
      stats: {
        first_name: 'Jimmy',
        last_name: 'Raynor',
        phone_number: '(888) 217 1436',
        position: 'Sales Manager',
        company: 'AI Learning',
        address: 'Albany, New York',
        time: '6:15 PM',
        group: 'Google Map List',
        line: 'Bently Personal'
      }
    }
  }
}
</script>
