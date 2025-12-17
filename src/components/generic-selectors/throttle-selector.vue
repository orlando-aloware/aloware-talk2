<template>
  <div>
    <vue-multiselect track-by="id"
                     label="name"
                     class="mr-1 chip__clear-blue shrink-options"
                     style="width: 100%"
                     placeholder="Select throttling"
                     :searchable="true"
                     :show-no-results="false"
                     :close-on-select="true"
                     :options="options"
                     :show-labels="false"
                     :allow-empty="false"
                     v-model="throttle"
                     @select="onSelect" />
  </div>
</template>

<script>
import VueMultiselect from 'vue-multiselect'
import { mapState } from 'vuex'

export default {
  name: 'throttle-selector',

  components: {
    VueMultiselect
  },

  props: {
    value: {
      type: Object,
      required: false,
      default: null
    },

    campaign: {
      type: Object,
      required: false,
      default: null
    }
  },

  computed: {
    ...mapState('cache', [
      'currentCompany'
    ]),

    options () {
      if (!this.campaign) {
        return []
      }

      const maxMps = this.campaign?.max_mps || 0
      const mpsList = [0.05, 0.1, 0.25, 0.5, 1, 2, 3, 4, 6, 8, 10]

      return mpsList
        .filter(mps => mps <= maxMps)
        .map((mps, index) => ({
          id: index + 1,
          name: `${mps * 60 * 60} per hour`,
          value: mps * 60
        }))
    }
  },

  data () {
    return {
      throttle: this.value
    }
  },

  methods: {
    onSelect (selected) {
      this.$emit('input', selected)
    }
  }
}
</script>

<style src="../../../node_modules/vue-multiselect/dist/vue-multiselect.min.css"></style>
