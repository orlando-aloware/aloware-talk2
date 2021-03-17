<template>
  <div>
    <contact-sm-icon/>
    <hold-sm-icon/>
    <keypad-sm-icon/>
    <merge-sm-icon/>
    <mute-sm-icon/>
    <note-sm-icon/>
    <plus-sm-icon/>
    <pause-rec-sm-icon/>
    <speaker-sm-icon/>
    <tag-sm-icon/>
    <transfer-sm-icon/>
    <voice-mail-sm-icon/>
  </div>
</template>

<script>
import ContactSmIcon from 'components/icons/calls-sm/contact-sm-icon'
import HoldSmIcon from 'components/icons/calls-sm/hold-sm-icon'
import KeypadSmIcon from 'components/icons/calls-sm/keypad-sm-icon'
import MergeSmIcon from 'components/icons/calls-sm/merge-sm-icon'
import MuteSmIcon from 'components/icons/calls-sm/mute-sm-icon'
import NoteSmIcon from 'components/icons/calls-sm/note-sm-icon'
import PlusSmIcon from 'components/icons/calls-sm/plus-sm-icon'
import PauseRecSmIcon from 'components/icons/calls-sm/pause-rec-sm-icon'
import SpeakerSmIcon from 'components/icons/calls-sm/speaker-sm-icon'
import TagSmIcon from 'components/icons/calls-sm/tag-sm-icon'
import TransferSmIcon from 'components/icons/calls-sm/transfer-sm-icon'
import VoiceMailSmIcon from 'components/icons/calls-sm/voice-mail-sm-icon'

export default {
  name: 'calls-sm-icons-view.vue',
  components: {
    VoiceMailSmIcon,
    TransferSmIcon,
    TagSmIcon,
    SpeakerSmIcon,
    PauseRecSmIcon,
    PlusSmIcon,
    NoteSmIcon,
    MuteSmIcon,
    MergeSmIcon,
    KeypadSmIcon,
    HoldSmIcon,
    ContactSmIcon
  }
}
</script>
