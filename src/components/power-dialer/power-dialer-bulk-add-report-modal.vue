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
        <li v-if="addedFromMultipleNumbers > 0">{{ addedFromMultipleNumbers }} tasks from multiple numbers</li>
        <li v-if="hasAddedDuplicates">{{ addedDuplicates }} duplicates</li>
        <li v-if="hasAddedOwnContacts">{{ addedOwnContacts }} owned contacts</li>
        <li v-if="hasAddedInternationalPhoneNumbers">{{ addedInternationalPhoneNumbers }} international phone numbers</li>
      </ul>
      <template v-if="skipped.length > 0">
        <p class="m-0">Contacts not added/skipped</p>
        <ul>
          <li v-for="(error, id) in skipped"
              v-bind:key="id">
            {{ error[1] }} {{ getErrorMessage(error[0]) }}
          </li>
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
import { PD_BULK_ADD_MESSAGES } from 'src/constants/power-dialer-add-errors'
import { get } from 'lodash'

export default {
  name: 'PowerDialerBulkAddReportModal',

  props: {
    statusReport: {
      type: Object,
      required: false,
      default: () => {}
    }
  },

  computed: {
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
      return this.statusReport?.info?.selected ?? 0
    },

    addedFromContact () {
      return this.statusReport?.success?.total ?? 0
    },

    addedFromMultipleNumbers () {
      return this.statusReport?.success?.multiple_numbers ?? 0
    },

    hasAddedDuplicates () {
      const flag = get(this.statusReport, 'success.duplicates', false)

      return this.$isNumeric(flag) ? true : flag
    },

    addedDuplicates () {
      return this.statusReport?.success?.duplicates ?? 0
    },

    hasAddedOwnContacts () {
      const flag = get(this.statusReport, 'success.own_contacts', false)

      return this.$isNumeric(flag) ? true : flag
    },

    addedOwnContacts () {
      return this.statusReport?.success?.own_contacts ?? 0
    },

    hasAddedInternationalPhoneNumbers () {
      const flag = get(this.statusReport, 'success.international_phone_numbers', false)

      return this.$isNumeric(flag) ? true : flag
    },

    addedInternationalPhoneNumbers () {
      return this.statusReport?.success?.international_phone_numbers ?? 0
    },

    skipped () {
      let errors = this.statusReport?.fail ?? {}
      return Object.entries(errors)
    },

    totalTasksAdded () {
      return this.addedFromContact + this.addedFromMultipleNumbers
    }
  },

  methods: {
    getErrorMessage (errorNumber) {
      return PD_BULK_ADD_MESSAGES[errorNumber]
    }
  }
}
</script>
