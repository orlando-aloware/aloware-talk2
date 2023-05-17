<template>
  <div class="broadcasts__add__view">
    <div class="broadcasts__add__view__form">
      <div class="broadcasts__add__view__form__header">
        {{ currentStep.name }}
      </div>

      <div class="broadcasts__add__view__form__content">
        <component :is="mainComponent"
                   ref="mainComponent"
                   @input="mainComponentChanged"
                   @list-updated="onListUpdated"/>
        <!-- broadcast-add-contact -->
        <!-- broadcast-add-message -->
        <!-- broadcast-add-schedule -->
        <!-- broadcast-add-preview -->
      </div>

      <div class="broadcasts__add__view__form__footer">
        <!-- footer components -->

        <!-- buttons -->
        <b-button class="mr-2"
                  size="sm"
                  variant="light"
                  v-if="currentStep.id > FIRST_STEP">
          Back
        </b-button>

        <b-button size="sm"
                  variant="primary"
                  v-if="currentStep.id === LAST_STEP">
          Send
        </b-button>

        <b-button size="sm"
                  variant="primary"
                  :disabled="!isMainComponentValid"
                  v-else>
          Next
        </b-button>
      </div>
    </div>

    <div class="broadcasts__add__view__details"
         v-if="footerComponent">
      <component :is="footerComponent"
                 ref="footerComponent"
                 v-bind="footerComponentProps"/>
    </div>
  </div>
</template>

<script>
import BroadcastAddViewContacts from './broadcast-add-view-contacts.vue'
import BroadcastContactsPreview from './broadcast-contacts-preview.vue'

const FIRST_STEP = 1
const LAST_STEP = 4

export default {
  name: 'broadcast-add-view',

  components: {
    BroadcastAddViewContacts,
    BroadcastContactsPreview
  },

  props: {
    currentStep: {
      type: Object,
      required: true
    },

    steps: {
      type: Array,
      required: true
    }
  },

  computed: {
    mainComponent () {
      switch (this.currentStep.id) {
        case 1:
          return 'broadcast-add-view-contacts'
        case 2:
          return 'broadcast-add-view-message'
        case 3:
          return 'broadcast-add-view-schedule'
        case 4:
          return 'broadcast-add-view-preview'
        default:
          throw new Error('Invalid step ' + this.currentStep.id)
      }
    },

    footerComponent () {
      switch (true) {
        case !!this.list.id:
          return 'broadcast-contacts-preview'
        default:
          return null
      }
    },

    footerComponentProps () {
      switch (true) {
        case !!this.list.id:
          return { list: this.list }
        default:
          return null
      }
    }
  },

  data: () => ({
    isMainComponentValid: false,
    list: {},
    FIRST_STEP,
    LAST_STEP
  }),

  methods: {
    mainComponentChanged (state) {
      this.isMainComponentValid = state
    },

    onListUpdated (list) {
      this.list = list
    }
  }
}
</script>
