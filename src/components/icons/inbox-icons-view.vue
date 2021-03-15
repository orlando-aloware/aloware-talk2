<template>
  <div class="icons-view">
    <div class="text-center">
      <phone-icon />
      <div class="small text-muted">phone</div>
    </div>
    <div class="text-center">
      <hide-minimize-icon />
      <div class="small text-muted">hide-minimize</div>
    </div>
    <div class="text-center">
      <message-icon />
      <div class="small text-muted">message</div>
    </div>
    <div class="text-center">
      <record-icon />
      <div class="small text-muted">record</div>
    </div>
    <div class="text-center">
      <show-content-icon />
      <div class="small text-muted">show-content</div>
    </div>
    <div class="text-center">
      <task-icon />
      <div class="small text-muted">task</div>
    </div>
    <div class="text-center">
      <voice-mail-icon />
      <div class="small text-muted">voice-mail</div>
    </div>
    <!-- ACTIVE -->
    <div class="text-center">
      <phone-icon iconColor="#00bf4a" />
      <div class="small text-muted">phone</div>
    </div>
    <div class="text-center">
      <message-icon iconColor="#00bf4a" />
      <div class="small text-muted">message</div>
    </div>
    <div class="text-center">
      <record-icon iconColor="#00bf4a" />
      <div class="small text-muted">record</div>
    </div>
    <div class="text-center">
      <show-content-icon iconColor="#00bf4a" />
      <div class="small text-muted">show-content</div>
    </div>
    <div class="text-center">
      <task-icon iconColor="#00bf4a" />
      <div class="small text-muted">task</div>
    </div>
    <div class="text-center">
      <voice-mail-icon iconColor="#00bf4a" />
      <div class="small text-muted">voice-mail</div>
    </div>
  </div>
</template>

<script>
import PhoneIcon from './phone-icon.vue'
import HideMinimizeIcon from './hide-minimize-icon.vue'
import MessageIcon from './message-icon.vue'
import RecordIcon from './record-icon.vue'
import ShowContentIcon from './show-content-icon.vue'
import TaskIcon from './task-icon.vue'
import VoiceMailIcon from './voicemail-icon.vue'

export default {
  components: {
    PhoneIcon,
    HideMinimizeIcon,
    MessageIcon,
    RecordIcon,
    ShowContentIcon,
    TaskIcon,
    VoiceMailIcon
  }
}
</script>

<style lang="sass" scoped>
.icons-view {
  display: grid;
  grid-template-rows: auto;
  grid-template-columns: auto auto auto auto auto auto auto auto;
  grid-gap: 10px;
}
</style>
