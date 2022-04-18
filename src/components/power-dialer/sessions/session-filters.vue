<template>
  <b-card class="bg-transparent border-0 text-center">
    <div class="t-grouped-buttons pr-1">
      <div
        v-for="(filter, key) in tabs"
        :key="key"
        class="link px-1" style="display:contents;">
        <div
          @click="clicked(filter, filter.enabled)"
          :class="`t-grouped-buttons__btn cursor-pointer ml-1 ${id === filter.id ? 'active' : ''} ${filter.enabled ? '' : 'disabled'}`">
          <div class="t-badge-name">
            {{ filter.name }}
          </div>
        </div>
      </div>
    </div>
  </b-card>
</template>

<script>

import { mapGetters } from 'vuex'

const DEFAULT_TAB = 1

export default {
  name: 'SessionFilters',
  computed: {
    ...mapGetters('contacts', [
      'contact'
    ]),
    hasHubspotEnabled () {
      return this.contact?.company?.hubspot_integration_enabled
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
          enabled: this.hasHubspotEnabled
        }
      ]
    }
  },
  methods: {
    clicked (value, enabled = true) {
      console.log('enabled :>> ', enabled)
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
