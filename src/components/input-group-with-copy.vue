<template>
  <b-input-group>
    <b-form-input type="text"
                  ref="input_copy"
                  readonly
                  v-model="value"
                  :placeholder="placeholder">

    </b-form-input>
    <b-input-group-append>
      <b-button size="sm"
                @click="copy">
        <i class="material-icons">content_copy</i>
      </b-button>
    </b-input-group-append>
  </b-input-group>
</template>

<script>
export default {
  name: 'input-group-with-copy',

  props: {
    value: {
      required: true
    },
    placeholder: {
      type: String,
      default: ''
    }
  },

  data () {
    return {
      isCopying: false,
      timeout: null
    }
  },

  methods: {
    copy () {
      const inputElement = this.$refs.input_copy

      this.isCopying = true
      inputElement.select()
      document.execCommand('copy')

      if (this.timeout) {
        clearTimeout(this.timeout)
      }

      this.timeout = setTimeout(() => {
        this.isCopying = false
        this.$generalNotification('Copied to clipboard.')
      }, 1000)
    }
  }
}
</script>
