<template>
  <b-modal title="Contact Upload Summary"
           size="md"
           centered
           no-close-on-esc
           v-model="isOpen">
    <div class="container">
      <p class="text-h5">{{ selected }} contact(s) selected</p>
      <p class="m-0">Contacts added</p>
      <ul>
        <li>{{ addedFromContact }} tasks from contacts</li>
        <li v-if="hasAddedFromMultipleNumbers">{{ addedFromMultipleNumbers }} tasks from multiple numbers</li>
        <li v-if="hasAddedDuplicates">{{ addedDuplicates }} duplicates</li>
        <li v-if="hasAddedOwnContacts">{{ addedOwnContacts }} owned contacts</li>
        <li v-if="hasAddedInternationalPhoneNumbers">{{ addedInternationalPhoneNumbers }} international phone numbers</li>
      </ul>
      <template v-if="skipped.length > 0">
        <p class="m-0">Contacts not added/skipped</p>
        <ul>
          <template v-for="(error, id) in skipped">
            <li v-if="isShowSkippedMessage(error[0], error[1])"
                v-bind:key="id">
              {{ error[1] }} {{ getErrorMessage(error[0]) }}
            </li>
          </template>
        </ul>
      </template>
      <p class="text-h5 font-weigh-bold">{{ totalTasksAdded }} Total tasks added to queue</p>
    </div>
    <template slot="modal-footer">
      <button class="btn btn-block mt-0 mr-2"
              :style="{ 'background': 'var(--gray)', 'color': 'white' }"
              @click="() => isOpen = false">
        Close
      </button>
    </template>
  </b-modal>
</template>
<script>
import { PD_BULK_ADD_MESSAGES, PD_INTEGRATION_IMPORT_MESSAGES } from 'src/constants/power-dialer-add-errors'
import { cloneDeep, get, isNil, isEmpty, omitBy } from 'lodash'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'PowerDialerBulkAddReportModal',

  props: {
    statusReport: {
      type: Object,
      required: false,
      default: () => {}
    }
  },

  data: () => ({
    fullReport: {}
  }),

  created () {
    this.buildReport()
  },

  computed: {
    ...mapState([
      'integrationPDImportSummaries'
    ]),

    isOpen: {
      get () {
        return Object.keys(this.statusReport ?? {}).length > 0
      },
      set (val) {
        this.$emit('close')
        return val
      }
    },

    selected () {
      return this.fullReport?.info?.selected ?? 0
    },

    addedFromContact () {
      return this.fullReport?.success?.total ?? 0
    },

    addedFromMultipleNumbers () {
      return this.fullReport?.success?.multiple_numbers ?? 0
    },

    hasAddedFromMultipleNumbers () {
      const flag = get(this.fullReport, 'success.multiple_numbers', false)

      return this.$isNumeric(flag) ? true : flag
    },

    hasAddedDuplicates () {
      const flag = get(this.fullReport, 'success.duplicates', false)

      return this.$isNumeric(flag) ? true : flag
    },

    addedDuplicates () {
      return this.fullReport?.success?.duplicates ?? 0
    },

    hasAddedOwnContacts () {
      const flag = get(this.fullReport, 'success.own_contacts', false)

      return this.$isNumeric(flag) ? true : flag
    },

    addedOwnContacts () {
      return this.fullReport?.success?.own_contacts ?? 0
    },

    hasAddedInternationalPhoneNumbers () {
      const flag = get(this.fullReport, 'success.international_phone_numbers', false)

      return this.$isNumeric(flag) ? true : flag
    },

    addedInternationalPhoneNumbers () {
      return this.fullReport?.success?.international_phone_numbers ?? 0
    },

    skipped () {
      let errors = this.fullReport?.fail ?? {}

      return Object.entries(errors)
    },

    totalTasksAdded () {
      return this.addedFromContact + this.addedFromMultipleNumbers
    }
  },

  methods: {
    ...mapActions([
      'removeIntegrationPDImportSummary'
    ]),

    isShowSkippedMessage (index, value) {
      return this.$isNumeric(index) ||
        (!this.$isNumeric(index) && value && this.getErrorMessage(index))
    },

    getErrorMessage (index) {
      if (this.$isNumeric(index)) {
        return PD_BULK_ADD_MESSAGES[index]
      }

      return PD_INTEGRATION_IMPORT_MESSAGES[index]
    },

    buildReport () {
      if (isEmpty(this.fullReport)) {
        return
      }

      this.fullReport = cloneDeep(this.statusReport)
      const id = this.$route.params.id
      const integrationReport = cloneDeep(this.integrationPDImportSummaries[id])
      // remove null/undefined values in object
      const failReport = omitBy(this.fullReport.fail, isNil)

      this.fullReport.fail = {
        ...integrationReport,
        ...failReport
      }

      const createdContactsCount = integrationReport?.created_contacts_count ?? 0
      const updatedContactsCount = integrationReport?.updated_contacts_count ?? 0
      const totalSelected = createdContactsCount + updatedContactsCount

      // update the total selected contacts to the correct total count
      this.fullReport.info.selected = totalSelected

      // clean-up
      this.removeIntegrationPDImportSummary(id)
    }
  },

  watch: {
    isOpen (value) {
      if (!value) {
        return
      }

      this.buildReport()
    }
  }
}
</script>
