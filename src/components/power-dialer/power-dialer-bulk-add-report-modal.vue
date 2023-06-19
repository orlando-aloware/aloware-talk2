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
        <li v-if="addedFromMultipleNumbers > 0">{{ addedFromMultipleNumbers }} added from multiple numbers</li>
      </ul>
      <template v-if="skipped.length > 0">
        <p class="m-0">Contacts not added/skipeed</p>
        <ul>
          <li v-for="(error, id) in skipped"
              v-bind:key="id">
            {{ error[1] }} {{ getErrorName(error[0]) }}
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
const ERROR_DICT = {
  1: 'Duplicated',
  2: 'Multiple numbers not allowed',
  3: 'Unauthorized disposition / DNC',
  4: 'No primary phone number',
  5: 'Invalid number',
  6: 'International Disallowed'
}

export default {
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

    skipped () {
      let errors = this.statusReport?.fail ?? {}
      return Object.entries(errors)
    },

    totalTasksAdded () {
      return this.addedFromContact + this.addedFromMultipleNumbers
    }
  },

  methods: {
    getErrorName (errorNumber) {
      return ERROR_DICT[errorNumber]
    }
  },

  mounted () {
    console.log({ statusReport: this.statusReport })
  }
}
</script>
