<template>
  <b-modal title="Contact Upload Summary"
           size="md"
           centered
           no-close-on-esc
           v-model="isOpen">
    <div class="container">
      <p>
        <span class="font-weight-bold">
          {{ selected }} {{ fixMessage('contact(s)', selected) }} selected
        </span>
        <span class="font-weight-light-bold">
          ({{ totalTasksToBeAdded }} {{ fixMessage('task(s)', totalTasksToBeAdded) }} to be added)
        </span>
      </p>
      <p class="m-0 font-weight-bold">
        {{ fixMessage('Contact(s)', addedFromContact) }} added
      </p>
      <ul>
        <li>
          {{ totalAddedFromContacts }} {{ fixMessage('task(s)', totalAddedFromContacts) }} from {{ fixMessage('contact(s)', totalAddedFromContacts) }}
        </li>
        <li v-if="addedFromMultipleNumbers">
          {{ addedFromMultipleNumbers }} {{ fixMessage('task(s)', addedFromMultipleNumbers) }} from multiple numbers
        </li>
        <li v-if="addedDuplicates">
          {{ addedDuplicates }} duplicate phone {{ fixMessage('number(s)', addedDuplicates) }}
        </li>
        <li v-if="addedOwnContacts">
          {{ addedOwnContacts }} owned {{ fixMessage('contact(s)', addedOwnContacts) }}
        </li>
        <li v-if="hasAddedInternationalPhoneNumbers">
          {{ addedInternationalPhoneNumbers }} international phone {{ fixMessage('number(s)', addedInternationalPhoneNumbers) }}
        </li>
      </ul>
      <template v-if="skipped.length > 0">
        <p class="m-0 font-weight-bold">
          Contacts not added/skipped
        </p>
        <ul>
          <li v-for="(error, id) in skipped"
              :key="id">
            {{ error[1] }} {{ getErrorMessage(error[0], error[1]) }}
          </li>
        </ul>
      </template>
      <p class="font-weigh-light-bold">
        {{ addedFromContact }} Total {{ fixMessage('task(s)', addedFromContact) }} added to queue
      </p>
      <p class="font-weight-light-bold"
         v-if="existingContactsBeforeImport">
        {{ existingContactsBeforeImport }} existing {{ fixMessage('task(s)', existingContactsBeforeImport) }} before import
      </p>
      <hr v-if="existingContactsBeforeImport"/>
      <p class="font-weight-bold"
         v-if="existingContactsBeforeImport">
        {{ addedFromContact + existingContactsBeforeImport }} Total {{ fixMessage('task(s)', addedFromContact + existingContactsBeforeImport) }} in queue
      </p>
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
import {
  DUPLICATED,
  PD_BULK_ADD_MESSAGES,
  PD_INTEGRATION_IMPORT_MESSAGES
} from 'src/constants/power-dialer-add-errors'
import { cloneDeep, get, isNil, isEmpty, omitBy } from 'lodash'
import { mapActions, mapGetters, mapState } from 'vuex'

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
    fullReport: {},
    duplicated_tasks: 0
  }),

  computed: {
    ...mapState([
      'integrationPDImportSummaries'
    ]),

    ...mapGetters('contacts', [
      'selectedList'
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
      return this.$isNumeric(this.fullReport?.info?.total_selected_contacts) ? this.fullReport?.info?.total_selected_contacts : 0
    },

    addedFromContact () {
      return this.fullReport?.success?.total ?? 0
    },

    totalAddedFromContacts () {
      let total = this.addedFromContact

      if (this.addedFromMultipleNumbers) {
        total -= this.addedFromMultipleNumbers
      }

      if (this.addedOwnContacts) {
        total -= this.addedOwnContacts
      }

      if (this.addedInternationalPhoneNumbers) {
        total -= this.addedInternationalPhoneNumbers
      }

      if (this.addedDuplicates) {
        total -= this.addedDuplicates
      }

      return total
    },

    totalTasksToBeAdded () {
      return this.addedFromContact + this.totalFailedTasks
    },

    totalFailedTasks () {
      let sum = 0
      for (const key in this.fullReport.fail) {
        if (typeof this.fullReport.fail[key] === 'number') {
          sum += this.fullReport.fail[key]
        }
      }
      return sum
    },

    uniqueContactsCount () {
      return this.fullReport?.info?.selected ?? 0
    },

    existingContactsBeforeImport () {
      return this.fullReport?.extra?.total_items_before_import ?? 0
    },

    addedFromMultipleNumbers () {
      return this.fullReport?.success?.multiple_numbers ?? 0
    },

    addedDuplicates () {
      return this.fullReport?.success?.duplicates ?? 0
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
      let skippedItems = this.fullReport?.fail ?? {}
      skippedItems = Object.entries(skippedItems)

      return skippedItems
    }
  },

  methods: {
    ...mapActions([
      'removeIntegrationPDImportSummary'
    ]),

    getErrorMessage (index, value) {
      if (this.$isNumeric(index)) {
        let message = this.fixMessage(PD_BULK_ADD_MESSAGES[index], value)
        // complement message if there are skipped contacts with duplicates
        if (index === '1') {
          message += this.duplicated_tasks ? ' (' + this.duplicated_tasks + ' duplicates)' : ''
        }
        return message
      }

      return this.fixMessage(PD_INTEGRATION_IMPORT_MESSAGES[index], value)
    },

    fixMessage (message, value) {
      if (!message) {
        return message
      }

      const postfix = value > 1 ? 's' : ''

      return message.replace('(s)', postfix)
    },

    buildReport () {
      this.fullReport = cloneDeep(this.statusReport)
      console.log('buildReport this.statusReport', this.statusReport)

      if (isEmpty(this.fullReport)) {
        return
      }

      const id = this.$route.params.id
      let integrationReport = this.$jsonClone(this.integrationPDImportSummaries[id])
      console.log('buildReport integrationReport', integrationReport)
      if (integrationReport) {
        this.fullReport.info.total_selected_contacts = integrationReport.total_selected_contacts
      }

      if (!integrationReport) {
        this.fullReport.info.total_selected_contacts = this.statusReport.extra.total_selected
      }

      if (isEmpty(integrationReport)) {
        integrationReport = {
          is_dnc: 0,
          is_blocked: 0,
          total_selected: 0
        }
      }

      const isDncFromImport = this.fullReport?.extra?.is_dnc || 0
      const isBlockedFromImport = this.fullReport?.extra?.is_blocked || 0

      if (isDncFromImport > integrationReport.is_dnc) {
        integrationReport.is_dnc = isDncFromImport
      }

      if (isBlockedFromImport > integrationReport.is_blocked) {
        integrationReport.is_blocked = isBlockedFromImport
      }

      integrationReport.total_selected += this.fullReport?.extra?.total_selected || 0

      const creationSettings = this.fullReport?.extra?.settings || {}
      const integrationDuplicates = integrationReport?.duplicates || 0
      const duplicatePhoneNumbers = this.fullReport?.success?.duplicates || 0

      if (!creationSettings?.prevent_duplicates) {
        this.fullReport.success.duplicates = integrationDuplicates > duplicatePhoneNumbers ? integrationDuplicates : duplicatePhoneNumbers
      } else if (creationSettings?.prevent_duplicates) {
        const duplicates = this.fullReport?.fail?.[DUPLICATED] || 0
        this.fullReport.fail[DUPLICATED] = integrationReport.duplicates > duplicates ? integrationReport.duplicates : duplicates
      }

      const createdContactsCount = integrationReport?.created_contacts_count || 0
      const updatedContactsCount = integrationReport?.updated_contacts_count || 0
      const selected = integrationReport?.total_selected || 0

      let totalSelected = createdContactsCount + updatedContactsCount
      totalSelected = selected > totalSelected ? selected : totalSelected

      // update the total selected contacts to the correct total count
      this.fullReport.info.selected = totalSelected

      // how many contacts have duplicates
      const duplicates = integrationReport?.duplicates ?? 0
      // the total of duplicates
      const duplicatedTasks = integrationReport?.duplicated_tasks ?? 0

      this.duplicated_tasks = duplicatedTasks ? duplicatedTasks - duplicates : 0

      // remove reports having no message or with 0 value
      Object.keys(integrationReport).forEach(key => {
        const reportMessage = this.fixMessage(PD_INTEGRATION_IMPORT_MESSAGES[key], integrationReport[key])
        if (isEmpty(reportMessage) || integrationReport[key] === 0) {
          delete integrationReport[key]
        }
      })

      // remove null/undefined values in object
      const failReport = omitBy(this.fullReport.fail, isNil)

      this.fullReport.fail = {
        ...integrationReport,
        ...failReport
      }

      console.log('buildReport this.fullReport', this.fullReport)

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
