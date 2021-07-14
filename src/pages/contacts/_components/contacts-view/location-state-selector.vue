<template>
  <div>
    <q-select class="inline-select"
              use-input
              clearable
              v-model="currentState"
              :options="options"
              :loading="isBusy"
              @focus="onFocus"
              @blur="onBlur"
              @input="onInput"
              @filter="filterFn"/>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import talk2Api from 'src/plugins/api/api'

export default {
  name: 'location-state-selector',
  props: {
    state: {
      type: String,
      required: false,
      default: ''
    }
  },
  computed: {
    ...mapGetters('contacts', ['contact']),
    isUSorCA () {
      return ['US', 'CA'].includes(this.contact.cnam_country)
    },
    states () {
      if (this.isUSorCA) {
        return this.contact.cnam_country === 'US' ? this.country_states.US : this.country_states.CA
      }
      return []
    },
    selectedState: {
      get () {
        return this.currentState
      },
      set (state) {
        return state
      }
    }
  },
  data () {
    return {
      isBusy: false,
      country_states: {
        US: ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'],
        CA: ['AB', 'BC', 'MB', 'NB', 'NL', 'NT', 'NS', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT']
      },
      options: this.states,
      currentState: this.state
    }
  },
  methods: {
    ...mapActions('contacts', ['setContact']),
    onFocus () {
      this.isFocused = true
      this.$el.querySelector('.inline-select .q-field__input').placeholder = this.selectedState ? this.selectedState : 'Select state'
      this.$el.querySelector('.inline-select .q-field__native span').style.display = 'none'
    },
    onBlur () {
      this.isFocused = false
      this.$el.querySelector('.inline-select .q-field__input').placeholder = ''
      this.$el.querySelector('.inline-select .q-field__native span').style.display = ''
    },
    onInput () {
      this.$el.querySelector('.inline-select .q-field__input').blur()
    },
    filterFn (val, update) {
      if (val === '') {
        update(() => {
          this.options = this.states
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.options = this.states.filter(v => v.toLowerCase().indexOf(needle) > -1)
      })
    },
    onUpdate () {
      this.isBusy = true
      talk2Api.V1.contact.update(this.contact.id, { 'cnam_state': this.contact.cnam_state }).then(response => {
        this.setContact(response.data)
      }).finally(() => {
        this.isBusy = false
      })
    }
  },
  watch: {
    'selectedState': function (value) {
      this.isBusy = true
      this.$emit('select', { value,
        callback: () => {
          this.isBusy = false
        } })
    }
  }
}
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
<style scoped>

</style>
