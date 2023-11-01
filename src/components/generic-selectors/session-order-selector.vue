<template>
  <q-select options-selected-class="text-primary"
            color="primary"
            option-label="text"
            option-value="id"
            input-debounce="0"
            use-input
            map-options
            outlined
            dense
            class="padded-container"
            :class="[ prepend ? 'with-prepend' : '' ]"
            :options="options"
            :disable="disable"
            :emit-value="true"
            :clearable="clearable"
            v-model="order">
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="no-results text-grey">
          No results
        </q-item-section>
      </q-item>
    </template>

    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps"
              v-on="scope.itemEvents">
        <q-item-section>
          <q-item-label v-html="scope.opt.text"/>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script>
import { POWER_DIALER_ORDER } from 'src/constants/power-dialer/power-dialer'

export default {
  name: 'session-order-selector',

  props: {
    value: [Number, String],

    disable: {
      type: Boolean,
      default: false,
      required: false
    },

    prepend: {
      type: String,
      required: false
    },

    clearable: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      order: null
    }
  },

  computed: {
    options () {
      return [
        {
          id: POWER_DIALER_ORDER.default,
          text: 'Default'
        },
        {
          id: POWER_DIALER_ORDER.timezone,
          text: 'Timezone'
        }
      ]
    }
  },

  created () {
    this.order = this.value ? this.value : POWER_DIALER_ORDER.default
  },

  watch: {
    value (value) {
      this.order = value
    },
    order () {
      this.$emit('change', this.order)
    }
  }
}
</script>
