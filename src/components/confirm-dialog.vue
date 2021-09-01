<template>
  <b-modal
    :id="id"
    :size="size"
    :title="title"
    modal-class="confirm-dialog"
    ref="modal"
    centered
    :hide-header="hideHeader"
    :hide-footer="hideFooter"
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
    },
    size: {
      type: String,
      default: 'md'
    },
    hideHeader: {
      type: Boolean,
      default: false
    },
    hideFooter: {
      type: Boolean,
      default: false
    }
  },
  mounted () {
    this.$refs.modal.$on('hidden', () => {
      this.$emit('close')
    })
  }
}
</script>
