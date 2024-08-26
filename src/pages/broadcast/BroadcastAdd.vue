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

    <div class="broadcasts__add__sidebar">
      <steps-wrapper :current-step="currentStep"
                     :steps="steps"/>
    </div>

    <broadcast-add-view :current-step="currentStep"
                        :steps="steps"
                        :first-step="steps[0].id"
                        :last-step="steps[steps.length - 1].id"
                        @next="onNext"
                        @back="onBack"
                        @loading="onLoading"/>

    <transition name="slide-left">
      <contacts-filters class="broadcasts__add__contacts-filters"
                        v-if="filters"/>
    </transition>
  </div>
</template>

<script>
import BroadcastAddView from 'src/components/broadcasts/broadcast-add-view.vue'
import ContactsFilters from 'src/components/contacts/contacts-filters.vue'
import StepsWrapper from 'src/components/generic-wrappers/steps-wrapper.vue'

export default {
  name: 'broadcast-add',

  components: {
    BroadcastAddView,
    ContactsFilters,
    StepsWrapper
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
    ],
    filters: false
  }),

  mounted () {
    this.$VueEvent.listen('toggle-contact-filters', (state) => {
      this.filters = state
    })
  },

  methods: {
    onBack () {
      this.step--
    },

    onNext () {
      this.step++
    },

    onLoading (state) {
      this.loading = state
    }
  }
}
</script>
