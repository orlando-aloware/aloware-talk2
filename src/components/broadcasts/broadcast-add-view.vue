<template>
  <div class="broadcasts__add__view">
    <div class="broadcasts__add__view__form">
      <div class="broadcasts__add__view__form__header">
        {{ currentStep.name }}
      </div>

      <div class="broadcasts__add__view__form__content">
        <transition mode="out-in"
                    :name="`horizontal-slide-${direction}`">
          <component :is="mainComponent"
                    ref="mainComponent"
                    v-bind="mainComponentProps"
                    @input="mainComponentChanged"
                    @source-updated="onSourceUpdated"
                    @type-updated="onTypeUpdated"
                    @rvm-updated="onRvmUpdated"
                    @price-updated="onPriceUpdated"
                    @time="onTimeUpdated"
                    @date-changed="onDateChanged"
                    @campaign="onCampaignUpdated"
                    @throttle="onThrottleUpdated"
                    @restricted-time="onRestrictedTimeChanged"/>
        </transition>
      </div>

      <div class="broadcasts__add__view__form__footer">
        <!-- buttons -->
        <compact-btn class="mr-2"
                     variant="outlined-light"
                     @clicked="back">
          Back
        </compact-btn>

        <compact-btn variant="primary"
                     v-if="currentStep.id === lastStep"
                     @clicked="send">
          Send
        </compact-btn>

        <compact-btn variant="primary"
                     :disabled="!isStepValid"
                     v-else
                    @clicked="next">
          Next
        </compact-btn>
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

    <confirm-dialog id="outside-business-hours-dialog"
                    :isOpen="outsideBusinessHoursDialog.open"
                    @close="onOutsideBusinessHoursDialogClosed">
      <template #content>
        {{ outsideBusinessHoursDialog.message }}
      </template>

      <template #footer>
        <div>
          <button class="btn btn-sm btn-light mr-2"
                  @click="onOutsideBusinessHoursDialogClosed">
            No
          </button>

          <button class="btn btn-sm btn-primary"
                  @click="onOutsideBusinessHoursDialogConfirmed">
            Yes
          </button>
        </div>
      </template>
    </confirm-dialog>
  </div>
</template>

<script>
import BroadcastAddCards from './broadcast-add-cards.vue'
import BroadcastAddViewContacts from './broadcast-add-view-contacts.vue'
import BroadcastAddViewMessage from './broadcast-add-view-message.vue'
import BroadcastAddViewPreview from './broadcast-add-view-preview.vue'
import BroadcastAddViewSchedule from './broadcast-add-view-schedule.vue'
import BroadcastContactsPreview from './broadcast-contacts-preview.vue'
import CompactBtn from 'components/compact-btn.vue'
import ConfirmDialog from 'components/confirm-dialog.vue'
import API from 'src/plugins/api/api'
import { mapGetters, mapState } from 'vuex'
import { isEmpty } from 'lodash'

export default {
  name: 'broadcast-add-view',

  components: {
    BroadcastAddCards,
    BroadcastAddViewContacts,
    BroadcastAddViewMessage,
    BroadcastAddViewPreview,
    BroadcastAddViewSchedule,
    BroadcastContactsPreview,
    CompactBtn,
    ConfirmDialog
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
    ...mapState('cache', [
      'currentCompany'
    ]),

    ...mapGetters('contacts', [
      'messageComposer'
    ]),

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
          return {
            contact: this.contactPreview,
            contactsLength: this.contactsLength,
            rvm: this.rvm
          }
        case 3:
          return {
            propCampaign: this.campaign,
            propThrottle: this.throttle,
            propTime: this.time
          }
        case 4:
          return {
            contact: this.contactPreview,
            campaign: this.campaign,
            contactsLength: this.contactsLength,
            date: this.date,
            source: this.source,
            throttle: this.throttle.name,
            type: this.type,
            rvm: this.rvm
          }
        default:
          return null
      }
    },

    footerComponent () {
      switch (true) {
        // FIXME: use mainComponentValid?
        case this.currentStep.id === 1 && (!isEmpty(this.source?.list) || !isEmpty(this.source.filters) || !isEmpty(this.source.integration?.list)):
          return 'broadcast-contacts-preview'
        case this.currentStep.id === 2 || this.currentStep.id === 3 || this.currentStep.id === 4:
          return 'broadcast-add-cards'
        default:
          return null
      }
    },

    footerComponentProps () {
      switch (true) {
        case this.currentStep.id === 1:
          return {
            list: this.source.list,
            filters: this.source.filters,
            integration: this.source.integration
          }
        case this.currentStep.id === 2 || this.currentStep.id === 3:
          return {
            contactsLength: this.contactsLength,
            estimatedCost: this.price
          }
        case this.currentStep.id === 4:
          return {
            contactsLength: this.contactsLength,
            estimatedCost: this.price,
            messagesLength: this.messagesLength
          }
        default:
          return null
      }
    },

    isStepValid () {
      switch (this.currentStep.id) {
        case 1:
          return this.isMainComponentValid && this.isFooterComponentValid
        case 2:
        case 3:
        case 4:
          return this.isMainComponentValid
        default:
          throw new Error('Invalid step ' + this.currentStep.id)
      }
    }
  },

  data: () => ({
    direction: 'left',
    isMainComponentValid: false,
    isFooterComponentValid: false,
    source: {},
    contactPreview: {},
    contactsLength: 0,
    type: null, // sms, voicemail
    rvm: null,
    price: 0,
    campaign: null,
    throttle: null,
    time: null, // holds the schedule's time options
    date: null, // holds the send datetime
    messagesLength: 0,
    isRestrictedTime: false,
    acceptedOutsideBusinessHours: false,
    outsideBusinessHoursDialog: {
      open: false,
      message: 'You are trying to send outside the restricted time. Are you sure that you have the consent of all the recipients?'
    }
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

    onTypeUpdated (type) {
      this.type = type
    },

    onRvmUpdated (file) {
      this.rvm = file
    },

    onPriceUpdated (price) {
      this.price = price
    },

    onTimeUpdated (time) {
      this.time = time
    },

    onDateChanged (date) {
      this.date = date
    },

    onCampaignUpdated (campaign) {
      this.campaign = campaign
    },

    onThrottleUpdated (throttle) {
      this.throttle = throttle
    },

    onRestrictedTimeChanged (restrictedTime) {
      this.isRestrictedTime = restrictedTime
    },

    onOutsideBusinessHoursDialogConfirmed () {
      this.acceptedOutsideBusinessHours = true
      this.outsideBusinessHoursDialog.open = false

      this.next()
    },

    onOutsideBusinessHoursDialogClosed () {
      this.outsideBusinessHoursDialog.open = false
    },

    next () {
      // send outside business hours confirmation
      if (this.currentStep.id === 3 && this.isRestrictedTime && !this.acceptedOutsideBusinessHours) {
        this.outsideBusinessHoursDialog.open = true

        return
      }

      this.isMainComponentValid = false
      this.isFooterComponentValid = false

      this.direction = 'right'
      this.$emit('next')
    },

    back () {
      if (this.currentStep.id === this.firstStep) {
        this.$router.push({
          path: '/broadcasts'
        })

        return
      }

      this.direction = 'left'
      this.$emit('back')
    },

    onContactPreview (contact) {
      this.contactPreview = contact
    },

    onContactsLength (count) {
      this.contactsLength = count
    },

    send () {
      this.$emit('loading', true)

      let method = null
      const bulkMessage = {
        name: '',
        count: this.contactsLength,
        campaign_id: this.campaign.id,
        run_at_date: this.date.substr(0, 10),
        run_at_time: this.date.substr(11, 10),
        message_body: this.messageComposer.sms.body,
        throttle_limit: this.throttle.value,
        accept_outside_business_hours: this.acceptedOutsideBusinessHours,
        is_scheduled: this.time.time === 'scheduled'
      }

      switch (this.type) {
        case 'sms':
          method = 'sendBulkMessage'

          // set attachment
          if (this.messageComposer.sms.gif_url) {
            bulkMessage.attachment_type = 'gif'
            bulkMessage.file_name = this.messageComposer.sms.gif_url
          } else if (this.messageComposer.sms.attachments.length) {
            bulkMessage.attachment_type = 'media'
            bulkMessage.file_name = this.messageComposer.sms.attachments[0].uuid
          }

          break

        case 'rvm':
          method = 'sendBulkRvm'
          bulkMessage.file_name = this.rvm.file_name

          break
      }

      bulkMessage.talk_filters = !isEmpty(this.source.filters) ? this.source.filters : null
      bulkMessage.contact_list_id = !isEmpty(this.source.list) ? this.source.list.id : null
      bulkMessage.list_id = !isEmpty(this.source.integration?.list) ? this.source.integration.list.listId : null

      // to be implemented
      // view_id: null, // Zoho
      // filter_id: null, // Pipedrive

      API.V1.broadcasts[method](bulkMessage)
        .then(() => {
          this.$emit('loading', false)

          this.$generalNotification('We have put your bulk message campaign on our outbound queue. Please wait a few minutes for us to send your messages.', 'success')

          this.$router.push({ path: '/broadcasts' })
        })
        .catch(err => {
          this.$emit('loading', false)

          this.$handleErrors(err.response)
        })
    }
  }
}
</script>
