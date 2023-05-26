<template>
  <div class="avatar"
       :class="{ 'avatar--src': src, 'avatar--active': active }"
       :style="computedStyle">
    <div class="avatar__inner"
         :class="{ 'avatar__inner--active': active }"
         :style="{ 'background-image': (src ? `url(${src})` : 'none') }">
      <sequence-icon v-if="sequenceIcon" />
      <span v-else-if="!name || !name.length">
        <i class="fa fa-user"/>
      </span>
      <span v-else>
        {{ avatarText }}
      </span>
    </div>
    <slot></slot>
  </div>
</template>

<script>
import { avatarMixin } from 'src/plugins/mixins'
import SequenceIcon from 'components/icons/contact-activity/sequence-icon'

export default {
  name: 'avatar',

  components: { SequenceIcon },

  mixins: [avatarMixin],

  computed: {
    computedStyle () {
      return { width: `${this.width}px`, height: `${this.height}px`, ...this.avatarStyle() }
    },

    avatarText () {
      let name = this.name || 'No Name'

      return this.$options.filters.initials(name)
    }
  },

  props: {
    active: {
      type: Boolean,
      default: false
    },

    name: {
      type: String
    },

    src: {
      type: String
    },

    width: {
      type: [String, Number],
      default: 30
    },

    height: {
      type: [String, Number],
      default: 30
    },

    sequenceIcon: {
      type: Boolean,
      default: false
    }
  }
}
</script>
