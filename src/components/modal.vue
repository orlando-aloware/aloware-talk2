<template>
  <b-modal
    :id="id"
    :dialog-class="className"
    :centered="centered"
    :no-close-on-backdrop="noCloseOnBackdrop"
    :no-close-on-esc="noCloseOnEsc"
  >
    <template #modal-title>
      <slot name="title" />
    </template>
    <slot name="body" />
    <template #modal-footer>
      <slot name="footer" />
    </template>
  </b-modal>
</template>

<script>
export default {
  props: {
    id: String,
    className: {
      type: String,
      default: 'modal-pd-add'
    },
    centered: {
      type: Boolean,
      default: true
    },
    noCloseOnBackdrop: {
      type: Boolean,
      default: true
    },
    noCloseOnEsc: {
      type: Boolean,
      default: true
    }
  }
}
</script>
