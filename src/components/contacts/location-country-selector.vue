<template>
  <div>
    <q-select class="inline-select"
              use-input
              clearable
              input-debounce="0"
              map-options
              emit-value
              option-value="code"
              option-label="name"
              behavior="menu"
              v-model="currentCountry"
              :options="options"
              :loading="isBusy"
              :disable="disabled"
              @focus="onFocus"
              @blur="onBlur"
              @input="onInput"
              @filter="filterFn"/>
  </div>
</template>

<script>
import * as Countries from 'src/constants/countries'
import talk2Api from 'src/plugins/api/api'
import { mapActions, mapGetters } from 'vuex'
// import VueMultiselect from 'vue-multiselect'
export default {
  name: 'location-country-selector',
  // components: { VueMultiselect },
  props: {
    country: {
      type: String,
      required: false,
      default: ''
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data () {
    return {
      isBusy: false,
      countries: Countries.COUNTRIES,
      options: Countries.COUNTRIES,
      currentCountry: this.country
    }
  },
  computed: {
    ...mapGetters('contacts', ['contact']),
    selectedCountry: {
      get () {
        return this.currentCountry
      },
      set (country) {
        return country
      }
    },
    selectedCountryObject () {
      return this.countries.find(country => country.code === this.selectedCountry)
    }
  },
  methods: {
    ...mapActions('contacts', ['setContact']),
    onFocus () {
      this.isFocused = true
      this.$el.querySelector('.inline-select .q-field__input').placeholder = this.selectedCountryObject ? this.selectedCountryObject.name : 'Select country'
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
          this.options = this.countries
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.options = this.countries.filter(v => v.name.toLowerCase().indexOf(needle) > -1)
      })
    },
    onUpdate () {
      this.isBusy = true
      talk2Api.V1.contact.update(this.contact.id, { 'cnam_country': this.contact.cnam_country }).then(response => {
        this.setContact(response.data)
      }).finally(() => {
        this.isBusy = false
      })
    }
  },
  watch: {
    'selectedCountry': function (value) {
      this.isBusy = true
      this.$emit('select', { value,
        callback: () => {
          this.isBusy = false
        } })
    }
  }
}
</script>

<style scoped>

</style>
