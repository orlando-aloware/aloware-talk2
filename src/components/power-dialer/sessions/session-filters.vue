<template>
  <b-card class="bg-transparent border-0 text-center">
    <div class="t-grouped-buttons pr-1">
      <div
        v-for="(filter, key) in tabs"
        :key="key"
        class="link px-1"
        style="display:contents;">
        <div
          :class="`t-grouped-buttons__btn cursor-pointer ml-1 ${id === filter.id ? 'active' : ''} ${filter.enabled ? '' : 'disabled'}`"
          @click="clicked(filter, filter.enabled)">
          <div class="t-badge-name">
            {{ filter.name }}
          </div>
          <q-tooltip v-if="filter.name === 'CRM View' && !hasHubspotEnabled && !isReferrizer"
                     content-class="bg-grey-light11"
                     anchor="bottom start"
                     self="center start"
                     :offset="[0, 18]">
            Hubspot integration is disabled.
          </q-tooltip>
        </div>
      </div>
    </div>
  </b-card>
</template>

<script>

import { mapGetters, mapState } from 'vuex'

const DEFAULT_TAB = 1

export default {
  name: 'SessionFilters',
  computed: {
    ...mapState('cache', ['currentCompany']),

    ...mapGetters('contacts', [
      'contact'
    ]),

    hasHubspotEnabled () {
      return this.currentCompany?.hubspot_integration_enabled
    },

    isReferrizer () {
      // dev testing
      if (process.env.APP_ENV !== 'production') {
        return this.currentCompany.id === 7
      }

      return this.currentCompany.id === 2140
    },

    tabs () {
      return [
        {
          id: 1,
          name: 'Details',
          enabled: true
        },
        {
          id: 2,
          name: 'Activity',
          enabled: true
        },
        {
          id: 3,
          name: 'CRM View',
          enabled: this.hasHubspotEnabled || this.isReferrizer
        }
      ]
    }
  },

  methods: {
    clicked (value, enabled = undefined) {
      if (enabled) {
        this.id = value.id
        this.$emit('selected-tab', value)
      }
    }
  },

  data () {
    return {
      id: DEFAULT_TAB
    }
  }
}
</script>
