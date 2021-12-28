<template>
  <div class="row no-wrap q-pt-none"
    @mouseover="hovered = true"
    @mouseleave="hovered = false">
    <q-input
      style="height: 32px;"
      v-show="active"
      outlined
      v-model="content"
      class="mr-2 input-field-shadow rounded-input"
      :ref="referenceName"
      @keyup.enter="handleInput"
      @keyup.esc="closeInput"
      @blur="closeInput" />
    <div
      style="height: 32px;"
      v-if="!active"
      class="pr-0 d-flex align-items-center">
      {{ modelValue }}
    </div>
    <div
      class="cursor-pointer"
      transtion-show="fade">
      <div
        ref="editGroup"
        @click="active = true">
        <PencilIcon
          v-if="editable"
          color="grey"
          :class="`${isVisible ? '' : 'make-invisible'} mx-2 my-1 mb-2`" />
      </div>
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
    },
    id: {
      type: [String, Number],
      default: 'X'
    },
    editMetricGroupId: {
      default: null,
      required: false
    },
    editable: {
      type: Boolean,
      default: true
    }
  },
  components: {
    PencilIcon
  },
  computed: {
    isVisible () {
      if (this.hovered && this.active === false) {
        return true
      }
      return false
    },
    referenceName () {
      return `update-group-name-${this.id}`
    }
  },
  methods: {
    handleInput: function (value) {
      if (!this.flag) {
        this.active = false
        if (this.modelValue !== this.content) {
          this.$emit('input', this.content)
        } else {
          this.$emit('close')
        }
      }
    },
    closeInput (value) {
      this.flag = true
      this.active = false
      this.$emit('close')
    }
  },
  watch: {
    active (val) {
      if (val) {
        this.content = this.modelValue
        this.flag = false
        setTimeout(() => {
          this.$refs[this.referenceName].focus()
        }, 10)
      }
    },
    editMetricGroupId () {
      if (this.editMetricGroupId === this.id) {
        this.active = this.editMetricGroupId !== null
      }
    }
  },
  data () {
    return {
      content: this.modelValue,
      hovered: false,
      active: false,
      flag: true
    }
  }
}
</script>
