<template>
  <div>
    <vue-multiselect track-by="value"
                     label="name"
                     class="mr-1 chip__clear-blue shrink-options"
                     style="width: 100%"
                     placeholder="Select timezone"
                     :searchable="true"
                     :showNoResults="false"
                     :close-on-select="true"
                     :options="timezones"
                     :show-labels="false"
                     :allow-empty="false"
                     v-model="timezone"
                     @select="onSelect" />
  </div>
</template>

<script>
import VueMultiselect from 'vue-multiselect'
import { mapGetters, mapState } from 'vuex'
export default {
  name: 'timezone-selector',
  components: { VueMultiselect },
  computed: {
    ...mapGetters({ }),
    ...mapState({ currentCompany: 'currentCompany' }),
    timezones () {
      if (this.currentCompany && this.currentCompany.country) {
        if (!['US', 'CA'].includes(this.currentCompany.country)) {
          return window.CountriesAndTimezones().getTimezonesForCountry(this.currentCompany.country)
            .map((timezone) => {
              return {
                name: timezone.name + ' GMT ' + timezone.utcOffsetStr,
                value: timezone.name
              }
            })
        }
        if (['US', 'CA'].includes(this.currentCompany.country)) {
          return [
            {
              value: 'America/New_York',
              name: 'New York (Eastern)'
            },
            {
              value: 'America/Chicago',
              name: 'Chicago (Central Standard Time)'
            },
            {
              value: 'America/Denver',
              name: 'Denver (Mountain Daylight Time)'
            },
            {
              value: 'America/Phoenix',
              name: 'Phoenix (Mountain Standard Time)'
            },
            {
              value: 'America/Los_Angeles',
              name: 'Los Angeles (Pacific Standard Time)'
            },
            {
              value: 'Pacific/Honolulu',
              name: 'Honolulu (Hawaii Standard Time)'
            }
          ]
        }
      }
      return []
    }
  },
  data () {
    return {
      timezone: null
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
