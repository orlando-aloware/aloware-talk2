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
                     @select="onSelect" />
  </div>
</template>

<script>
import VueMultiselect from 'vue-multiselect'
export default {
  name: 'predefined-time-selector',
  components: { VueMultiselect },
  computed: {
    times () {
      const times = []
      for (let hour = 6; hour < 24; hour++) {
        times.push({
          label: window.moment({ hour }).format('h:mm A'),
          value: window.moment({ hour }).format('HH:mm')
        })
        times.push({
          label: window.moment({ hour, minute: 15 }).format('h:mm A'),
          value: window.moment({ hour, minute: 15 }).format('HH:mm')
        }
        )
        times.push({
          label: window.moment({ hour, minute: 30 }).format('h:mm A'),
          value: window.moment({ hour, minute: 30 }).format('HH:mm')
        }
        )
        times.push({
          label: window.moment({ hour, minute: 45 }).format('h:mm A'),
          value: window.moment({ hour, minute: 45 }).format('HH:mm')
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
  methods: {
    onSelect (selected) {
      this.$emit('select', selected)
    }
  }
}
</script>

<style scoped>

</style>
