<template>
  <vue-multiselect track-by="value"
                   label="name"
                   class="mr-1 chip__clear-blue shrink-options"
                   style="width: 100%"
                   placeholder="Select type"
                   :searchable="true"
                   :showNoResults="false"
                   :close-on-select="true"
                   :options="options"
                   :show-labels="false"
                   :allow-empty="false"
                   :disabled="disabled"
                   v-model="type"
                   @select="onSelect" />
</template>

<script>
import VueMultiselect from 'vue-multiselect'
import * as CommunicationTypes from '../../constants/communication-types'

export default {
  name: 'communication-type-selector',

  components: {
    VueMultiselect
  },

  props: {
    value: {
      type: Number,
      required: false
    },

    disabled: {
      type: Boolean,
      default: false
    },

    from: {
      type: String,
      required: false,
      default: 'calendar'
    }
  },

  data () {
    return {
      type: null,
      options: []
    }
  },

  mounted () {
    this.loadTypes()

    if (this.value) {
      this.type = this.options.find(option => option.value === this.value)
    }
  },

  methods: {
    loadTypes () {
      switch (this.from) {
        case 'calendar':
          this.options = this.getCalendarTypes()
          break
      }
    },

    getCalendarTypes () {
      return [
        {
          name: 'Appointment',
          value: CommunicationTypes.APPOINTMENT
        },
        {
          name: 'Reminder',
          value: CommunicationTypes.REMINDER
        }
      ]
    },

    onSelect (type) {
      this.$emit('input', type.value)
    }
  }
}
</script>
