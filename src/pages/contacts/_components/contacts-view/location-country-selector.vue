<template>
  <div>
    <q-select class="inline-select"
              use-input
              input-debounce="0"
              map-options
              emit-value
              option-value="code"
              option-label="name"
              behavior="menu"
              v-model="contact.cnam_country"
              :options="options"
              :loading="is_busy"
              @filter="filterFn"/>
  </div>
</template>

<script>
import * as Countries from '../../../../constants/countries'
import talk2Api from 'src/plugins/api/api'
import { mapActions, mapGetters } from 'vuex'
export default {
  name: 'location-country-selector',
  data () {
    return {
      is_busy: false,
      user_id: this.value,
      countries: Countries.COUNTRIES,
      options: Countries.COUNTRIES
    }
  },
  computed: {
    ...mapGetters('contacts', ['contact'])
  },
  methods: {
    ...mapActions('contacts', ['setContact']),
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
      this.is_busy = true
      talk2Api.V1.contact.update(this.contact.id, { 'cnam_country': this.contact.cnam_country }).then(response => {
        this.setContact(response.data)
      }).finally(() => {
        this.is_busy = false
      })
    }
  },
  watch: {
    'contact.cnam_country': function () {
      this.onUpdate()
    }
  }
}
</script>

<style scoped>

</style>
