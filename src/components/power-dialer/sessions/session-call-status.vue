<template>
  <div class="t-menu-2 no-border">
    <div class="d-flex align-items-center pt-3 pb-0">
      <div class="font-weight-bold pl-3 flex-grow-1">
        <q-chip color="grey-50" class="p-0">
          <div class="text-15 text-lowercase text-capitalize px-2">
            Will call in
            <span class="text-weight-bold text-grey-7 text-lowercase">
              99s
            </span>
          </div>
        </q-chip>
      </div>
      <q-btn no-wrap outline no-caps size="sm" color="grey-4" class="sessions-button free-width mx-1">
        <PauseIcon class="mr-2" color="#62666E" />
        <div class="text-body2 text-black">Hold</div>
      </q-btn>
      <q-btn no-wrap unelevated no-caps size="sm" color="red-7" class="sessions-button free-width mx-1">
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
      <div class="text-18 font-weight-bold pl-3 flex-grow-1">
        {{ stats.first_name }} {{ stats.last_name }}
        <span class="text-15 text-subtitle1">{{ stats.phone_number }}</span>
      </div>
    </div>
    <div class="d-flex align-items-center p-0">
      <div class="text-h6 pl-3 text-subtitle1 text-capitalize">
        {{ stats.position }}
        <span class="text-subtitle2 text-grey"> | {{ stats.company }}</span>
      </div>
    </div>
    <div class="d-flex align-items-center p-0">
      <div class="flex-grow-1 text-h6 text-subtitle1 text-capitaliz pl-3 py-0">
        <DropIcon width="18px" height="18px" class="mr-0 py-0" style="position:relative;top:-2px;" />
        {{ stats.address }} - {{ stats.time }}
      </div>
      <q-btn no-wrap outline no-caps size="sm" color="grey-4" class="sessions-button free-width mx-1">
        <StopIcon class="mr-2" color="#62666E" />
        <div class="text-body2 text-black">Stop Rec.</div>
      </q-btn>
    </div>
    <div class="d-flex align-items-center p-0 pt-2">
      <div class="flex-grow-1 text-16 text-capitalize pl-3 text-weight-normal">
        {{ stats.group }}
        <span class="text-subtitle2 text-grey"></span>
        <div class="text-10 pt-1">
          <HeadphoneIcon width="12px" height="12px" class="mr-0 py-0" style="position:relative;top:-2px;" />
          {{ stats.line }}
        </div>
      </div>
      <q-btn no-wrap outline no-caps size="sm" color="grey-4" class="sessions-button free-width mx-1">
        <PauseIcon class="mr-2" color="#62666E" />
        <div class="text-body2 text-black">Pause Session</div>
      </q-btn>
      <q-btn no-wrap outline no-caps size="sm" color="grey-4" class="sessions-button free-width mx-1">
        <EndCallIcon class="mr-2" color="#62666E" />
        <div class="text-body2 text-black">End Session</div>
      </q-btn>
    </div>
  </div>
</template>

<script>

import DropIcon from 'components/icons/drop-location-icon'
import HeadphoneIcon from 'components/icons/headphone-icon'
import PauseIcon from 'components/icons/pause-icon-2'
import CallDropIcon from 'components/icons/call-drop-icon'
import StopIcon from 'components/icons/stop-icon'
import EndCallIcon from 'components/icons/stop-icon-2'

export default {
  name: 'SessionCallStatus',
  components: {
    DropIcon,
    HeadphoneIcon,
    PauseIcon,
    CallDropIcon,
    StopIcon,
    EndCallIcon
  },
  data () {
    return {
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
