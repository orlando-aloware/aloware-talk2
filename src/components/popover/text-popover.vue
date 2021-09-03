<template>
  <div class="row no-wrap q-pt-none"
    @mouseover="hovered = true"
    @mouseleave="hovered = false">
    <q-input
      v-if="active"
      outlined
      v-model="content"
      class="pr-2"
      @keyup.enter="handleInput" />
    <div
      v-else
      class="pr-2">
      {{ modelValue }}
    </div>
    <div
      class="cursor-pointer"
      @click="active = true">
      <PencilIcon
        v-show="hovered && active === false"
        color="grey"
        class="m-2" />
    </div>
  </div>
</template>

<script>

import PencilIcon from 'components/icons/pencil-o-icon'

export default {
  name: 'TextPopover',
  model: {
    prop: 'modelValue',
    event: 'change'
  },
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  components: {
    PencilIcon
  },
  methods: {
    handleInput: function (value) {
      this.active = false
      this.$emit('input', this.content)
    }
  },
  data () {
    return {
      content: this.modelValue,
      hovered: false,
      active: false
    }
  }
}
</script>
