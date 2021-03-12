<template>
  <div class="icons-view">
    <div class="text-center">
      <phone />
      <div class="small text-muted">phone</div>
    </div>
    <div class="text-center">
      <hide-minimize />
      <div class="small text-muted">hide-minimize</div>
    </div>
    <div class="text-center">
      <message />
      <div class="small text-muted">message</div>
    </div>
    <div class="text-center">
      <record />
      <div class="small text-muted">record</div>
    </div>
    <div class="text-center">
      <show-content />
      <div class="small text-muted">show-content</div>
    </div>
    <div class="text-center">
      <task />
      <div class="small text-muted">task</div>
    </div>
    <div class="text-center">
      <voice-mail />
      <div class="small text-muted">voice-mail</div>
    </div>
    <!-- ACTIVE -->
    <div class="text-center">
      <phone iconColor="#00bf4a" />
      <div class="small text-muted">phone</div>
    </div>
    <div class="text-center">
      <hide-minimize iconColor="#00bf4a" />
      <div class="small text-muted">hide-minimize</div>
    </div>
    <div class="text-center">
      <message iconColor="#00bf4a" />
      <div class="small text-muted">message</div>
    </div>
    <div class="text-center">
      <record iconColor="#00bf4a" />
      <div class="small text-muted">record</div>
    </div>
    <div class="text-center">
      <show-content iconColor="#00bf4a" />
      <div class="small text-muted">show-content</div>
    </div>
    <div class="text-center">
      <task iconColor="#00bf4a" />
      <div class="small text-muted">task</div>
    </div>
    <div class="text-center">
      <voice-mail iconColor="#00bf4a" />
      <div class="small text-muted">voice-mail</div>
    </div>
  </div>
</template>

<script>
import Phone from './phone.vue'
import HideMinimize from './hide-minimize.vue'
import Message from './message.vue'
import Record from './record.vue'
import ShowContent from './show-content.vue'
import Task from './task.vue'
import VoiceMail from './voicemail.vue'

export default {
  components: {
    Phone,
    HideMinimize,
    Message,
    Record,
    ShowContent,
    Task,
    VoiceMail
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
