<template>
  <div>
    <vue-multiselect track-by="value"
                     label="label"
                     class="mr-1 chip__clear-blue shrink-options"
                     style="width: 100%"
                     placeholder="Select time"
                     :searchable="true"
                     :showNoResults="false"
                     :close-on-select="true"
                     :options="times"
                     :show-labels="false"
                     :allow-empty="false"
                     v-model="time"
                     data-testid="predefined-time-multiselector"
                     @select="onSelect" />
  </div>
</template>

<script>
import VueMultiselect from 'vue-multiselect'

export default {
  name: 'predefined-time-selector',

  components: {
    VueMultiselect
  },

  props: {
    value: {
      type: String,
      required: false,
      default: null
    }
  },

  computed: {
    times () {
      const times = []
      const hour = { data: 6 }

      for (hour.data = 6; hour.data < 24; hour.data++) {
        times.push({
          label: window.moment({ hour: hour.data }).format('h:mm A'),
          value: window.moment({ hour: hour.data }).format('HH:mm')
        })
        times.push({
          label: window.moment({ hour: hour.data, minute: 15 }).format('h:mm A'),
          value: window.moment({ hour: hour.data, minute: 15 }).format('HH:mm')
        }
        )
        times.push({
          label: window.moment({ hour: hour.data, minute: 30 }).format('h:mm A'),
          value: window.moment({ hour: hour.data, minute: 30 }).format('HH:mm')
        }
        )
        times.push({
          label: window.moment({ hour: hour.data, minute: 45 }).format('h:mm A'),
          value: window.moment({ hour: hour.data, minute: 45 }).format('HH:mm')
        }
        )
      }

      return times
    }
  },

  data () {
    return {
      time: null
    }
  },

  mounted () {
    // if component value is set, search for that specific time only to fill as the option
    if (this.value) {
      this.time = this.times.find(time => time.value === this.value)
    }
  },

  methods: {
    onSelect (selected) {
      this.$emit('select', selected)
    }
  }
}
</script>
