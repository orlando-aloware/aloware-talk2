<template>
  <confirm-dialog title="Oops!"
                  id="pro-feature-alert"
                  hideFooter
                  :isOpen="isOpen"
                  @close="close"
                  @hide="close">
    <template #content>
      <div class="text-center">
        <p>
          Sorry, you don't have permission to use this feature. Please contact support to activate it.
        </p>
        <compact-btn variant="primary"
                     class="ml-3"
                     :disabled="false"
                     @clicked="close">
          Ok
        </compact-btn>
      </div>
    </template>
  </confirm-dialog>
</template>

<script>
import ConfirmDialog from 'components/confirm-dialog.vue'
import CompactBtn from 'components/compact-btn'
export default {
  name: 'pro-feature-dialog',
  components: {
    ConfirmDialog,
    CompactBtn
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    close () {
      this.$emit('close')
    }
  }
}
</script>
