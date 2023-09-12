<template>
  <div>
    <vue-multiselect track-by="value"
                     label="label"
                     openDirection="top"
                     class="mr-1 chip__clear-blue shrink-options"
                     style="width: 100%"
                     placeholder="Select reminder frequency"
                     :searchable="true"
                     :showNoResults="false"
                     :close-on-select="true"
                     :options="durations"
                     :show-labels="false"
                     :allow-empty="true"
                     :multiple="multiple"
                     v-model="frequencies"
                     @input="onSelect"
                     @remove="onRemove" />
  </div>
</template>

<script>
import VueMultiselect from 'vue-multiselect'
export default {
  name: 'number-of-days-selector',

  components: {
    VueMultiselect
  },

  props: {
    multiple: {
      type: Boolean,
      required: false,
      default: true
    },

    value: {
      type: [Array, Number],
      required: false,
      default: null
    },

    durations: {
      type: Array,
      required: false,
      default: function () {
        return [
          {
            label: 'On appointment day',
            value: 0
          },
          {
            label: '1 day before',
            value: 1
          },
          {
            label: '2 days before',
            value: 2
          },
          {
            label: '3 days before',
            value: 3
          },
          {
            label: '4 days before',
            value: 4
          },
          {
            label: '5 days before',
            value: 5
          },
          {
            label: '6 days before',
            value: 6
          },
          {
            label: '7 days before',
            value: 7
          }
        ]
      }
    }
  },

  data () {
    return {
      frequencies: this.multiple ? [] : null
    }
  },

  computed: {
    frequenciesValues () {
      return this.frequencies.map((item) => {
        return item.value
      })
    }
  },

  mounted () {
    if (this.value && this.multiple) {
      this.frequencies = this.durations.filter(frequency => this.value.includes(frequency.value))
    }
  },

  methods: {
    onSelect () {
      this.$emit('select', this.frequenciesValues)
    },
    onRemove () {
      this.$emit('select', this.frequenciesValues)
    }
  }
}
</script>

<style scoped>

</style>
