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
                   @source-updated="onSourceUpdated"
                   @sms-price-updated="onSmsPriceUpdated"
                   @time="onTimeUpdated"
                   @campaign="onCampaignUpdated"
                   @throttle="onThrottleUpdated"/>
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
                 @contact-preview="onContactPreview"
                 @contacts-length="onContactsLength"/>
    </div>
  </div>
</template>

<script>
import BroadcastAddCards from './broadcast-add-cards.vue'
import BroadcastAddViewContacts from './broadcast-add-view-contacts.vue'
import BroadcastAddViewMessage from './broadcast-add-view-message.vue'
import BroadcastAddViewSchedule from './broadcast-add-view-schedule.vue'
import BroadcastContactsPreview from './broadcast-contacts-preview.vue'
import { isEmpty } from 'lodash'

export default {
  name: 'broadcast-add-view',

  components: {
    BroadcastAddCards,
    BroadcastAddViewContacts,
    BroadcastAddViewMessage,
    BroadcastAddViewSchedule,
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
        case 2:
          return { contact: this.contactPreview, contactsLength: this.contactsLength }
        default:
          return null
      }
    },

    footerComponent () {
      switch (true) {
        // FIXME: use only source?
        case this.currentStep.id === 1 && (!!this.source.list?.id || !isEmpty(this.source.filters)):
          return 'broadcast-contacts-preview'
        case this.currentStep.id === 2 || this.currentStep.id === 3:
          return 'broadcast-add-cards'
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
        case this.currentStep.id === 2 || this.currentStep.id === 3:
          return { contactsLength: this.contactsLength, estimatedCost: this.smsPrice }
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
        case 3:
          return this.isMainComponentValid
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
    contactPreview: {},
    contactsLength: 0, // FIXME: is this necessary?
    type: null, // sms, voicemail
    smsPrice: 0,
    campaign: null,
    throttle: null,
    time: null
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

    onSmsPriceUpdated (price) {
      this.smsPrice = price
    },

    onTimeUpdated (time) {
      this.time = time
    },

    onCampaignUpdated (campaign) {
      this.campaign = campaign
    },

    onThrottleUpdated (throttle) {
      this.throttle = throttle
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
    },

    onContactsLength (count) {
      this.contactsLength = count
    }
  }
}
</script>
