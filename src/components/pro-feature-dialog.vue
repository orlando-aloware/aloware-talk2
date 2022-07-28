<template>
  <confirm-dialog title="Oops!"
                  id="pro-feature-alert"
                  hideFooter
                  :isOpen="showProFeatureDialog"
                  @close="toggleProFeatureDialog(false)"
                  @hide="toggleProFeatureDialog(false)">
    <template #content>
      <div class="text-center">
        <p>
          Sorry, you don't have permission to use this feature. Please contact support to activate it.
        </p>
        <compact-btn variant="primary"
                     class="ml-3"
                     :disabled="false"
                     @clicked="toggleProFeatureDialog(false)">
          Ok
        </compact-btn>
      </div>
    </template>
  </confirm-dialog>
</template>

<script>
import ConfirmDialog from 'components/confirm-dialog.vue'
import CompactBtn from 'components/compact-btn'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'pro-feature-dialog',

  components: {
    ConfirmDialog,
    CompactBtn
  },

  computed: {
    ...mapState(['showProFeatureDialog'])
  },

  methods: {
    ...mapActions(['toggleProFeatureDialog'])
  }
}
</script>
