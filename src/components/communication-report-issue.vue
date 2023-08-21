<template>
  <div class="report-issue-wrapper">
    <b-button variant="primary"
              size="sm"
              class="mr-1 btn-block"
              @click="showIntercom">
      Report Issue
    </b-button>
    <b-modal
      title="Report Issue"
      size="lg"
      scrollable
      no-close-on-esc
      no-close-on-backdrop
      v-model="isOpen"
      :hide-footer="false"
    >
      <b-overlay
        spinner-variant="primary"
        spinner-type="grow"
        rounded="sm"
        spinner-small
        :show="isBusy"
      >
        <div class="d-flex flex-column position-relative">

          <div class="pt-3">
            <form ref="form" @submit.stop.prevent="onSubmit">
              <b-form-group
                label="Category:"
              >
                <b-button class="mr-2"
                          size="sm"
                          v-for="category in categories"
                          :key="category.value"
                          :variant="category.value === form.category ? 'success' : 'outline-success'"
                          @click="form.category = category.value">{{ category.label }}</b-button>
              </b-form-group>
              <b-form-group
                label="Provide specifics on any issue related to this communication:"
              >
                <b-textarea placeholder="Enter issue details here..."
                            autofocus
                            ref="issueMessage"
                            rows="10"
                            max-rows="15"
                            v-model="form.message"></b-textarea>
              </b-form-group>
            </form>
          </div>
        </div>
      </b-overlay>
      <template #modal-footer>
        <div class="w-100">

          <b-button
            variant="primary"
            size="sm"
            class="float-right"
            :disabled="isBusy || !form.message.trim()"
            @click="onSubmit"
          >
            Report
          </b-button>
          <p class="float-right fs-12 mr-2 mt-1 text-muted">Message will be sent to support@aloware.com</p>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script>

import * as CustomerIssues from 'src/constants/customer-issues'
import talk2Api from 'src/plugins/api/api'
export default {
  name: 'communication-report-issue',

  props: {
    communicationId: {
      required: true
    }
  },

  data () {
    return {
      isOpen: false,
      isBusy: false,
      form: {
        message: '',
        category: CustomerIssues.DATA_ACCURACY
      },
      categories: [
        {
          label: 'Data Accuracy',
          value: CustomerIssues.DATA_ACCURACY
        },
        {
          label: 'Call Quality',
          value: CustomerIssues.CALL_QUALITY
        },
        {
          label: 'Other',
          value: CustomerIssues.OTHER
        }
      ],
      CustomerIssues
    }
  },
  methods: {
    onClose () {
      this.isOpen = false
    },
    onSubmit () {
      this.isBusy = true
      talk2Api.V1.communication.reportIssue(this.communicationId, this.form).then(response => {
        this.isBusy = false
        this.isOpen = false
        this.$generalNotification(`Our support team has been notified. We will be in touch shortly.`, 'success')
      }).catch(err => {
        this.isBusy = false
        this.$generalNotification(`Error while submitting report. Please try again.`, 'error')
        console.log(err)
      })
    },
    showIntercom (event) {
      if (window.Intercom) {
        window.Intercom('show')
      }
    }
  }
}
</script>
