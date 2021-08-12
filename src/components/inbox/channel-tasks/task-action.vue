<template>
  <div class="task-action">
    <div class="task-action__inner">
      <div class="task-action__icon">
        <component v-bind:is="icon"></component>
      </div>
      <span class="task-action__label">
        {{ label }}
      </span>
    </div>
  </div>
</template>

<script>
import Voicemail from 'components/icons/calls-sm/voice-mail-sm-icon'
import Transfer from 'components/icons/calls-sm/transfer-sm-icon'
import Tag from 'components/icons/calls-sm/tag-sm-icon'
import Speaker from 'components/icons/calls-sm/speaker-sm-icon'
import Plus from 'components/icons/calls-sm/plus-sm-icon'
import Pause from 'components/icons/calls-sm/pause-rec-sm-icon'
import Note from 'components/icons/calls-sm/note-sm-icon'
import Mute from 'components/icons/calls-sm/mute-sm-icon'
import Merge from 'components/icons/calls-sm/merge-sm-icon'
import Keypad from 'components/icons/calls-sm/keypad-sm-icon'
import Hold from 'components/icons/calls-sm/hold-sm-icon'
import Contact from 'components/icons/calls-sm/contact-sm-icon'

export default {
  name: 'task-action.vue',
  components: {
    Voicemail,
    Transfer,
    Tag,
    Speaker,
    Plus,
    Pause,
    Note,
    Mute,
    Merge,
    Keypad,
    Hold,
    Contact
  },
  props: {
    label: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: 'voicemail'
    }
  }
}
</script>
