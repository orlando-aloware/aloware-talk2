<template>
  <div class="broadcasts__add position-relative">
    <b-overlay class="h-100 w-100 position-absolute"
               rounded="sm"
               :show="true"
               v-show="loading">
      <template #overlay>
        <q-spinner-bars color="primary"
                        size="40px" />
      </template>
    </b-overlay>

    <broadcast-add-sidebar :current-step="currentStep"
                           :steps="steps"/>

    <broadcast-add-view :current-step="currentStep"
                        :steps="steps"
                        :first-step="steps[0].id"
                        :last-step="steps[steps.length - 1].id"
                        @next="onNext"
                        @back="onBack"/>

    <broadcast-add-filters />
  </div>
</template>

<script>
import BroadcastAddFilters from 'src/components/broadcasts/broadcast-add-filters.vue'
import BroadcastAddSidebar from 'src/components/broadcasts/broadcast-add-sidebar.vue'
import BroadcastAddView from 'src/components/broadcasts/broadcast-add-view.vue'

export default {
  name: 'broadcast-add',

  components: {
    BroadcastAddFilters,
    BroadcastAddSidebar,
    BroadcastAddView
  },

  computed: {
    currentStep () {
      return this.steps.find(step => step.id === this.step)
    }
  },

  data: () => ({
    step: 1,
    loading: false,
    steps: [
      {
        id: 1,
        name: 'Select Contacts'
      },
      {
        id: 2,
        name: 'Select Message'
      },
      {
        id: 3,
        name: 'Set Schedule'
      },
      {
        id: 4,
        name: 'Preview & Send'
      }
    ]
  }),

  methods: {
    onBack () {
      this.step--
    },

    onNext () {
      this.step++
    }
  }
}
</script>
