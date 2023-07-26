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
import { simpsocialMixin } from 'src/plugins/mixins'
import { mapState } from 'vuex'

export default {
  name: 'throttle-selector',

  mixins: [
    simpsocialMixin
  ],

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

      const options = []

      // @custom for SimpSocial resold accounts and Bluepen Funding and for Teli lines
      if (this.isSimpSocial || this.currentCompany.id === 444 || this.campaign.has_messaging_service) {
        options.push(...[
          {
            id: 1,
            name: '240 per hour',
            value: 4
          },
          {
            id: 2,
            name: '480 per hour',
            value: 8
          },
          {
            id: 3,
            name: '960 per hour',
            value: 16
          },
          {
            id: 4,
            name: '1980 per hour',
            value: 33
          },
          {
            id: 5,
            name: '10000 per hour',
            value: 167
          }
        ])

        // remove last two items if it's not Bluepen Funding
        if (this.currentCompany.id !== 444) {
          options.pop()
          options.pop()
        }

        return options
      }

      let mpsList = [0.05, 0.1, 0.25, 0.5, 1, 2, 3, 4, 6, 8, 10]

      for (let index = 0; mpsList[index] <= this.campaign.max_mps; index++) {
        options.push({
          id: index + 1,
          name: mpsList[index] * 60 * 60 + ' per hour',
          value: mpsList[index] * 60
        })
      }

      return options
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
