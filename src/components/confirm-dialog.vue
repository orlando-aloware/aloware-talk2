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

<style lang="scss">
@import '../css/mixins';
@import '../css/variables';
@import '../css/breakpoints';
.confirm-dialog {
  .modal-title {
    color: $dark;
    font-size: 16px;
    font-weight: bold;
  }
  .modal-header {
    background-color: $white;
    border-radius: 0;
    padding: 15px;
    .close {
      color: $dark;
    }
  }
  .modal-content {
    border-radius: 0;
    border: none;
    font-size: 14px;
  }
  .modal-footer {
    .action-btn {
      min-width: 120px;
    }
  }
}
</style>
