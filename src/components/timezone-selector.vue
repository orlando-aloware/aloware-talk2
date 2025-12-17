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
                     data-testid="timezone-multiselector"
                     @select="onSelect" />
  </div>
</template>

<script>
import VueMultiselect from 'vue-multiselect'
import { mapState } from 'vuex'
export default {
  name: 'timezone-selector',

  components: {
    VueMultiselect
  },

  props: {
    value: {
      type: String,
      required: false,
      default: null
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany'])
  },

  data () {
    return {
      timezone: null,
      timezones: []
    }
  },

  mounted () {
    this.setTimezones()
    this.setValue()
  },

  methods: {
    setValue () {
      if (this.value) {
        let timezone = this.timezones.find(tz => tz.value === this.value)

        // this might happen when the contact's timezone isnt present in the timezones list
        if (!timezone) {
          timezone = this.addTimezone(this.value)
        }

        this.timezone = timezone
      }
    },

    onSelect (selected) {
      this.$emit('select', selected)
    },

    setTimezones () {
      if (this.currentCompany && this.currentCompany.country) {
        if (!['US', 'CA'].includes(this.currentCompany.country)) {
          this.timezones = window.CountriesAndTimezones.getTimezonesForCountry(this.currentCompany.country)
            .map((timezone) => {
              return {
                name: timezone.name + ' GMT ' + timezone.utcOffsetStr,
                value: timezone.name
              }
            })
        }
        if (['US', 'CA'].includes(this.currentCompany.country)) {
          this.timezones = [
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
    },

    addTimezone (timezone) {
      const tz = {
        name: timezone,
        value: timezone
      }

      // add the custom timezone as the first option in the list
      this.timezones.unshift(tz)

      return tz
    }
  },

  watch: {
    value () {
      // configure timezone object when value changes
      this.setValue()
    }
  }
}
</script>
