<template>
  <b-modal
    :id="id"
    size="md"
    :title="title"
    modal-class="confirm-dialog"
    ref="modal"
    centered
  >
    <slot name="content" />
    <template slot="modal-footer">
      <slot name="footer" />
    </template>
  </b-modal>
</template>

<script>
export default {
  props: {
    id: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: 'Confirmation'
    },
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  mounted () {
    this.$refs.modal.$on('close', () => {
      this.$emit('close')
    })
  }
}
</script>
