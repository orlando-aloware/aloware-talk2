<template>
  <div>
    <q-input
      ref="notesInput"
      outlined
      autogrow
      :debounce="debounce"
      v-model="notes"
      data-testid="contact-notes-input"
      @input="onInput"
      @blur="onBlur"
    />
  </div>
</template>

<script>
export default {
  name: 'contact-notes-input',
  props: {
    value: {
      required: false,
      default: ''
    },
    debounce: {
      required: false,
      default: 500
    }
  },
  data () {
    return {
      notes: this.value
    }
  },
  methods: {
    onInput (value) {
      this.$emit('input', value)
    },
    onBlur () {
      this.$emit('blur')
    }
  },
  mounted () {
    this.$nextTick(function () {
      this.$refs.notesInput.focus()
    })
  }
}
</script>
