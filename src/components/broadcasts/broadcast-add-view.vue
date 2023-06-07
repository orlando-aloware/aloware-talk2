<template>
  <div class="broadcasts__add__view">
    <div class="broadcasts__add__view__form">
      <div class="broadcasts__add__view__form__header">
        {{ currentStep.name }}
      </div>

      <div class="broadcasts__add__view__form__content">
        <!-- broadcast-add-contact -->
        <component :is="mainComponent"
                   ref="mainComponent"
                   v-bind="mainComponentProps"
                   @input="mainComponentChanged"
                   @source-updated="onSourceUpdated"/>
        <!-- broadcast-add-message -->
        <!-- broadcast-add-schedule -->
        <!-- broadcast-add-preview -->
      </div>

      <div class="broadcasts__add__view__form__footer">
        <!-- buttons -->
        <b-button class="mr-2"
                  size="sm"
                  variant="light"
                  v-if="currentStep.id > firstStep"
                  @click="back">
          Back
        </b-button>

        <b-button size="sm"
                  variant="primary"
                  v-if="currentStep.id === lastStep">
          Send
        </b-button>

        <b-button size="sm"
                  variant="primary"
                  :disabled="!isStepValid"
                  v-else
                  @click="next">
          Next
        </b-button>
      </div>
    </div>

    <div class="broadcasts__add__view__details"
         v-if="footerComponent">
      <component :is="footerComponent"
                 ref="footerComponent"
                 v-bind="footerComponentProps"
                 @input="footerComponentChanged"
                 @contact-preview="onContactPreview"/>
    </div>
  </div>
</template>

<script>
import BroadcastAddViewContacts from './broadcast-add-view-contacts.vue'
import BroadcastAddViewMessage from './broadcast-add-view-message.vue'
import BroadcastContactsPreview from './broadcast-contacts-preview.vue'
import { isEmpty } from 'lodash'

export default {
  name: 'broadcast-add-view',

  components: {
    BroadcastAddViewContacts,
    BroadcastAddViewMessage,
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
    },

    firstStep: {
      type: Number,
      required: true
    },

    lastStep: {
      type: Number,
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

    mainComponentProps () {
      switch (this.currentStep.id) {
        case 1:
          return { defaultSource: this.source }
        default:
          return { contact: this.contactPreview }
      }
    },

    footerComponent () {
      switch (true) {
        // FIXME: use only source?
        case this.currentStep.id === 1 && (!!this.source.list?.id || !isEmpty(this.source.filters)):
          return 'broadcast-contacts-preview'
        default:
          return null
      }
    },

    footerComponentProps () {
      switch (true) {
        case this.currentStep.id === 1 && !!this.source.list?.id:
          return { list: this.source.list }
        case this.currentStep.id === 1 && !isEmpty(this.source.filters):
          return { filters: this.source.filters }
        default:
          return null
      }
    },

    isStepValid () {
      switch (this.currentStep.id) {
        case 1:
          return this.isMainComponentValid && this.isFooterComponentValid
        case 2:
          return this.isMainComponentValid
        // case 3:
        //   return 'broadcast-add-view-schedule'
        // case 4:
        //   return 'broadcast-add-view-preview'
        default:
          throw new Error('Invalid step ' + this.currentStep.id)
      }
    }
  },

  data: () => ({
    isMainComponentValid: false,
    isFooterComponentValid: false,
    source: {},
    contactPreview: {}
  }),

  methods: {
    mainComponentChanged (state) {
      this.isMainComponentValid = state
    },

    footerComponentChanged (state) {
      this.isFooterComponentValid = state
    },

    onSourceUpdated (source) {
      this.source = source
    },

    next () {
      this.isMainComponentValid = false
      this.isFooterComponentValid = false

      this.$emit('next')
    },

    back () {
      this.$emit('back')
    },

    onContactPreview (contact) {
      this.contactPreview = contact
    }
  }
}
</script>
