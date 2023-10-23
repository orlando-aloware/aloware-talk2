<template>
  <div :class="['col-xs-12', colMd, paddingClasses]">
    <label class="flex mb-1 text-weight-medium">
      {{ label }}
    </label>
    <q-input
      rounded
      outlined
      :placeholder="placeholder"
      :rules="rules"
      :type="fieldType"
      :mask="mask"
      :value="innerValue"
      @input="emitUpdateEvent"
    >
      <template
        v-if="isPassword"
        v-slot:append>
        <q-icon
          class="cursor-pointer"
          :name="show_password ? 'visibility_off' : 'visibility'"
          @click="toggleVisibility"
        />
      </template>
    </q-input>
    <slot name="hint"></slot>
  </div>
</template>

<script>
export default {
  name: 'InputField',

  props: {
    label: {
      type: String,
      required: true
    },
    placeholder: {
      type: String,
      required: true
    },
    value: {
      type: String,
      default: ''
    },
    colMd: {
      type: String,
      default: 'col-md-5'
    },
    paddingClasses: {
      type: String,
      default: ''
    },
    rules: {
      type: Array,
      default: () => []
    },
    type: {
      type: String,
      default: 'text'
    },
    mask: {
      type: String,
      default: ''
    },
    isPassword: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      show_password: false,
      innerValue: this.value
    }
  },

  computed: {
    fieldType () {
      return this.isPassword && !this.show_password ? 'password' : this.type
    }
  },

  methods: {
    toggleVisibility () {
      this.show_password = !this.show_password
    },

    emitUpdateEvent (value) {
      this.innerValue = value
      this.$emit('input', this.innerValue)
    }
  },

  watch: {
    value (value) {
      this.innerValue = value
    }
  }
}
</script>
