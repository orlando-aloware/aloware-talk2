<template>
  <b-modal title="Contact Upload Summary"
           size="md"
           centered
           no-close-on-esc
           v-model="isOpen">
    <div class="container">
      <p class="text-h5">{{ selected }} {{ fixMessage('contact(s)', selected) }} selected</p>
      <p class="m-0">{{ fixMessage('Contact(s)', addedFromContact) }} added</p>
      <ul>
        <li>{{ addedFromContact }} {{ fixMessage('task(s)', addedFromContact) }} from {{ fixMessage('contact(s)', selected) }}</li>
        <li v-if="hasAddedFromMultipleNumbers">{{ addedFromMultipleNumbers }} {{ fixMessage('task(s)', addedFromMultipleNumbers) }} from multiple numbers</li>
        <li v-if="hasAddedDuplicates">{{ addedDuplicates }} duplicate phone {{ fixMessage('number(s)', addedDuplicates) }}</li>
        <li v-if="hasAddedOwnContacts">{{ addedOwnContacts }} owned {{ fixMessage('contact(s)', addedOwnContacts) }}</li>
        <li v-if="hasAddedInternationalPhoneNumbers">{{ addedInternationalPhoneNumbers }} international phone {{ fixMessage('number(s)', addedInternationalPhoneNumbers) }}</li>
      </ul>
      <template v-if="skipped.length > 0">
        <p class="m-0">Contacts not added/skipped</p>
        <ul>
          <li v-for="(error, id) in skipped"
              v-bind:key="id">
            {{ error[1] }} {{ getErrorMessage(error[0], error[1]) }}
          </li>
        </ul>
      </template>
      <p class="text-h5 font-weigh-bold">{{ addedFromContact }} Total {{ fixMessage('task(s)', addedFromContact) }} added to queue</p>
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
    fullReport: {}
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
        return this.fixMessage(PD_BULK_ADD_MESSAGES[index], value)
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

      if (isEmpty(this.fullReport)) {
        return
      }

      const id = this.$route.params.id
      let integrationReport = this.$jsonClone(this.integrationPDImportSummaries[id])

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
