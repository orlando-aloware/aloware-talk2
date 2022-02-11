<template>
  <div>
    <vue-multiselect track-by="value"
                     label="label"
                     class="mr-1 chip__clear-blue shrink-options"
                     style="width: 100%"
                     placeholder="Select duration"
                     :searchable="true"
                     :showNoResults="false"
                     :close-on-select="true"
                     :options="durations"
                     :show-labels="false"
                     :allow-empty="false"
                     v-model="duration"
                     @select="onSelect" />
  </div>
</template>

<script>
import VueMultiselect from 'vue-multiselect'
export default {
  name: 'predefined-time-duration-selector',
  components: { VueMultiselect },
  props: {
    durations: {
      type: Array,
      required: false,
      default: function () {
        return [
          {
            label: '15 Minutes',
            value: 15
          },
          {
            label: '30 Minutes',
            value: 30
          },
          {
            label: '1 Hour',
            value: 60
          },
          {
            label: '1 Hour and 30 Minutes',
            value: 90
          },
          {
            label: '2 Hours',
            value: 120
          }
        ]
      }
    }
  },
  data () {
    return {
      duration: null
    }
  },
  methods: {
    onSelect (selected) {
      this.$emit('select', selected)
    }
  }
}
</script>
