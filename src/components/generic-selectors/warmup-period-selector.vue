<template>
  <q-select ref="warmupPeriod"
            class="padded-container"
            options-selected-class="text-primary"
            option-label="text"
            option-value="value"
            dense
            outlined
            :options="warmups"
            :disable="disable"
            :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
            :emit-value="true"
            :display-value="`${localValue === '0' || localValue === 0 ? 'No Warm Up' : localValue + ' seconds'}`"
            v-model="localValue"
            @popup-show="onShowWarmUpMenu"/>
</template>

<script>

import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'WarmupPeriodSelector',

  model: {
    prop: 'modelValue',
    event: 'change'
  },

  props: {
    modelValue: [Number, String],

    options: {
      type: Array,
      default: () => []
    },

    customClass: {
      type: String,
      default: ''
    },

    disable: {
      type: Boolean,
      default: false,
      required: false
    }
  },

  computed: {
    ...mapGetters('powerDialer', [
      'warmupDurations'
    ]),

    localValue: {
      get () {
        return `${this.modelValue || 0}`
      },
      set (val) {
        this.$emit('change', val)
      }
    },

    warmups () {
      let values = []

      this.warmupDurations.forEach(w => {
        values.push({
          text: w === 0 ? 'No Warm Up' : `${w} seconds`,
          value: w
        })
      })
      return values
    }
  },

  async mounted () {
    await this.getWarmupDurations()
  },

  data () {
    return {
      selectWidth: ''
    }
  },

  methods: {
    ...mapActions('powerDialer', [
      'getWarmupDurations'
    ]),

    onShowWarmUpMenu () {
      this.selectWidth = this.$refs.warmupPeriod.$el.offsetWidth
    }
  },

  watch: {
    localValue (value) {
      this.$emit('change', value)
    }
  }
}
</script>
