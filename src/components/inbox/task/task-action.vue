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

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';

.task-action {
  display: flex;
  width: 80px;
  height: 80px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 100ms ease-in;

  &:hover {
    background-color: $grey-light2;
  }

  &__inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  &__icon {
    margin-bottom: 5px;
  }

  &__label {
    color: $grey-dark;
    font-size: 14px;
    letter-spacing: 0.35px;
    line-height: 19px;
    text-align: center;
  }
}
</style>
