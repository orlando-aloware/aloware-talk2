<template>
  <q-dialog
    v-model="isOpen"
    persistent
    :maximized="false"
    :full-width="false"
    :full-height="false"
  >
    <q-card class="microphone-permission-modal">
      <q-card-section class="text-center">
        <div class="text-h6 font-weight-bold">Giving Microphone Access to {{ whiteLabelName }}</div>
      </q-card-section>

      <q-card-section class="text-center">
        <div class="text-center q-mb-md">
          <img src="/images/mic-step-1.png" alt="Step 1: Microphone icon in address bar" class="step-1-image mw-100" />
          <div class="d-flex justify-center my-3">
            <i class="fa fa-arrow-down"></i>
          </div>
          <img src="/images/mic-step-2.png" alt="Step 2: Allow microphone access" class="step-2-image mw-100" />
        </div>
        <p>In order to make or receive calls you need to make sure that you have granted microphone access to {{ whiteLabelName }}.</p>
        <p>To do so please <strong>click the icon in your browser's address bar and toggle on the microphone access.</strong></p>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          label="Close"
          color="grey"
          @click="closeModal"
        />
        <q-btn
          unelevated
          label="Refresh Page"
          color="primary"
          @click="refreshPage"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { whiteLabelMixin } from 'src/plugins/mixins'

export default {
  name: 'MicrophonePermissionModal',
  mixins: [whiteLabelMixin],

  data () {
    return {
      isOpen: false
    }
  },

  methods: {
    show () {
      this.isOpen = true
    },

    closeModal () {
      this.isOpen = false
    },

    refreshPage () {
      window.location.reload()
    }
  }
}
</script>

<style scoped>
.microphone-permission-modal {
  @media (min-width: 600px) {
    max-width: 480px;
  }

  .step-1-image {
    width: 320px;
  }

  .step-2-image {
    width: 330px;
  }
}
</style>
