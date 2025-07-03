<template>
  <div class="wallboard__header">
    <div class="wallboard__header__title bordered-bottom">
      Your Contact Center
    </div>
    <div class="wallboard__header__actions bordered-bottom">
      For {{ new Date() | fullShortDate }}

      <div class="d-flex align-items-center ml-2">
        <line-selector class="mr-2 filter-selector"
                       clearable
                       specific-class="pb-0"
                       hide-bottom-space
                       :generic-multiselect="false"
                       :generic-styling="true"
                       :value="filters.campaignId"
                       v-if="!isAgentsRoute"
                       @change="onFilterLine">
        </line-selector>

        <ring-group-selector class="mr-2 filter-selector"
                             clearable
                             :generic-multiselect="false"
                             :is-generic-selector-style="true"
                             :value="filters.ringGroup"
                             @change="onFilterRingGroup">
        </ring-group-selector>

        <team-selector class="mr-2 filter-selector"
                       clearable
                       :generic-multiselect="false"
                       :is-generic-selector-style="true"
                       :value="filters.teamId"
                       @change="onFilterTeam">
        </team-selector>
      </div>

      <div class="flex-grow-1 text-right">
        <wallboard-view-mode-button class="ml-2"/>
      </div>
    </div>
  </div>
</template>

<script>
import LineSelector from 'src/components/generic-selectors/line-selector.vue'
import RingGroupSelector from 'src/components/generic-selectors/ring-group-selector.vue'
import TeamSelector from 'src/components/generic-selectors/team-selector.vue'
import WallboardViewModeButton from 'src/components/wallboard/wallboard-view-mode-button.vue'
import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
  name: 'wallboard-header',

  components: {
    LineSelector,
    RingGroupSelector,
    TeamSelector,
    WallboardViewModeButton
  },

  computed: {
    ...mapGetters('wallboard', {
      filters: 'getFilters'
    }),

    isAgentsRoute () {
      return this.$route.name === 'Wallboard Agents'
    }
  },

  methods: {
    ...mapActions('wallboard', [
      'fetchSummary'
    ]),

    ...mapMutations('wallboard', {
      setFilter: 'SET_FILTER'
    }),

    onFilterLine (selectedValue) {
      this.setFilter({
        filter: 'campaignId',
        value: selectedValue
      })

      // automatically refresh summary when line changes
      this.fetchSummary()
    },

    onFilterRingGroup (selectedValue) {
      this.setFilter({
        filter: 'ringGroup',
        value: selectedValue
      })

      // automatically refresh summary when ring group changes
      this.fetchSummary()
    },

    onFilterTeam (selectedValue) {
      this.setFilter({
        filter: 'teamId',
        value: selectedValue
      })

      // automatically refresh summary when team changes
      this.fetchSummary()
    }
  }
}
</script>

<style>
.filter-selector .q-basic-selector {
  width: 160px;
}
</style>
