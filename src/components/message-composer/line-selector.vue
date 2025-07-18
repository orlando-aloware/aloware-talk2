<template>
  <div>
    <q-select class="inline-select show-caret__always caret__grey-90"
              use-input
              ref="lineSelector"
              input-debounce="100"
              option-value="id"
              option-label="name"
              behavior="menu"
              placeholder="Select line..."
              v-model="selectedLine"
              :options="lineOptions"
              :loading="isBusy"
              :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
              :disable="disable"
              data-testid="line-selector"
              @popup-show="onShowMenu"
              @focus="onFocus"
              @blur="onBlur"
              @input="onInput"
              @filter="filterLineFn">
      <template v-slot:option="scope">
        <q-item v-if="!scope.opt.group"
                v-bind="scope.itemProps"
                v-on="scope.itemEvents"
                data-testid="line-selector-option"
                v-close-popup>
          <q-item-section>
            <q-item-label v-html="scope.opt.name"></q-item-label>
          </q-item-section>
          <q-item-section v-if="isMessagingBlocked(scope.opt, checkBlockedMessaging, false, true)" side>
            <q-tooltip anchor="top middle"
                       self="center middle">
              {{ getMessagingBlocked(scope.opt) }}
            </q-tooltip>
            <q-badge color="blue">i</q-badge>
          </q-item-section>
        </q-item>
        <q-item v-if="scope.opt.group"
                v-bind="scope.itemProps"
                v-on="scope.itemEvents">
          <q-item-label header class="group-label">{{ scope.opt.group }}</q-item-label>
        </q-item>
      </template>
      <template v-if="selectedLine && Object.keys(selectedLine).length > 0" v-slot:selected>
        <div class="selected-option-container"
             v-html="getSelectedLineLabel()">
        </div>
      </template>
    </q-select>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import { aclMixin, contactMixin, contactV2AttributesMixin, selectorMixin, visibilityMixin } from 'src/plugins/mixins'
import talk2Api from 'src/plugins/api/api'
import talk2TeamInboxApi from 'src/plugins/api/teamInboxApi'
import _ from 'lodash'
import { isIvrOrDeadEndCampaign } from 'src/plugins/helpers/campaigns'

export default {
  name: 'line-selector',

  mixins: [
    contactMixin,
    contactV2AttributesMixin,
    aclMixin,
    visibilityMixin,
    selectorMixin
  ],

  props: {
    campaignId: {
      required: false
    },

    checkBlockedMessaging: {
      type: Boolean,
      default: false
    },

    disable: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapGetters('contacts', ['contact']),
    ...mapGetters('TeamInbox', ['activeInboxCampaignIds']),
    ...mapState(['campaigns']),
    ...mapState('TeamInbox', ['activeInbox']),

    /**
     * Returns the appropriate campaigns array based on whether we're in team inbox mode
     */
    campaignsToUse () {
      return this.teamInbox ? this.activeCampaigns : this.campaigns
    },

    /**
     * Returns the active campaigns
     */
    activeCampaigns () {
      return this
        .campaigns
        .filter(campaign =>
          // Active Inbox Campaigns
          this.activeInboxCampaignIds?.includes(campaign.id) ||
          isIvrOrDeadEndCampaign(campaign)
        )
    },

    selectedCampaign () {
      if (this.campaignsToUse) {
        // It returns the campaign validating the campaignId and the incoming_number
        return this.campaignsToUse.find(campaign => campaign.id === this.campaignId && campaign.incoming_number)
      }

      return null
    },

    formattedLineOptions () {
      const contactLines = { data: [] }
      if (this.contactCampaignsFromCommunications.length > 0) {
        contactLines.data = [...this.contactCampaignsFromCommunications.filter(item => item.active === true)]

        contactLines.data.unshift({
          group: 'Contact Lines',
          disable: true
        })
      }

      const linesArray = { data: contactLines.data }

      if (this.otherCampaignsFromCommunications && this.otherCampaignsFromCommunications.length > 0) {
        const otherLines = [...this.otherCampaignsFromCommunications.filter(item => item.active === true)]
        otherLines.unshift({
          group: 'Other Lines',
          disable: true
        })
        linesArray.data = [...contactLines.data, ...otherLines]
      }

      return linesArray.data
    },

    /**
     * Override contactCampaignsFromCommunications from contactMixin to use campaignsToUse
     */
    contactCampaignsFromCommunications () {
      if (this.contact && this.campaignsToUse.length) {
        return this.campaignsAlphabeticalOrder
      }

      return []
    },

    /**
     * Override otherCampaignsFromCommunications from contactMixin to use campaignsToUse
     */
    otherCampaignsFromCommunications () {
      if (this.campaignsToUse && this.contactCampaignsFromCommunications) {
        return _.difference(this.campaignsAlphabeticalOrder, this.contactCampaignsFromCommunications)
      }

      if (this.campaignsToUse) {
        return this.campaignsAlphabeticalOrder
      }

      return []
    },

    /**
     * Override campaignsAlphabeticalOrder from contactMixin to use campaignsToUse
     */
    campaignsAlphabeticalOrder () {
      if (this.campaignsToUse) {
        return _.clone(this.campaignsToUse).sort((a, b) => {
          const textA = a.name.toUpperCase()
          const textB = b.name.toUpperCase()

          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
        })
      }

      return []
    }
  },

  data () {
    return {
      isBusy: false,
      selectedLine: null,
      lineOptions: this.formattedLineOptions,
      incomingNumber: null,
      isFocused: false,
      selectWidth: 0,
      canEmail: false
    }
  },

  mounted () {
    this.showPlaceholder()

    if (this.contact && this.contact.id) {
      this.lineOptions = this.formattedLineOptions
      this.setIncomingNumber()
    }
  },

  methods: {
    ...mapActions('contacts', [
      'setLineIncomingNumberLoading',
      'setLineIncomingNumber'
    ]),

    onShowMenu () {
      this.selectWidth = this.$refs.lineSelector.$el.offsetWidth
    },
    onFocus () {
      this.isFocused = true
      this.$el.querySelector('.inline-select .q-field__input').placeholder = this.selectedLine ? this.selectedLine.name : this.getPlaceholderText()
      this.$el.querySelector('.inline-select .q-field__input').style.display = 'block'
      if (this.selectedLine) {
        this.$el.querySelector('.inline-select .selected-option-container').style.display = 'none'
      }
    },

    onBlur () {
      this.isFocused = false
      this.$el.querySelector('.inline-select .q-field__input').placeholder = ''
      this.showPlaceholder()
      if (this.selectedLine) {
        this.$el.querySelector('.inline-select .selected-option-container').style.display = ''
      }
    },

    getPlaceholderText () {
      return this.formattedLineOptions.length > 0 ? 'Select line' : 'No lines are available'
    },

    showPlaceholder () {
      if (!this.selectedLine) {
        this.$el.querySelector('.inline-select .q-field__input').placeholder = this.getPlaceholderText()
        this.$el.querySelector('.inline-select .q-field__input').style.display = 'block'
      } else {
        this.$el.querySelector('.inline-select .q-field__input').style.display = 'none'
      }
    },

    onInput (value) {
      this.$el.querySelector('.inline-select .q-field__input').blur()
      this.getIncomingNumber()
      this.$emit('change', value)
    },

    filterLineFn (val, update) {
      if (val === '') {
        update(() => {
          this.lineOptions = this.formattedLineOptions
        })
        return
      }
      update(() => {
        const needle = val.toLowerCase()
        this.lineOptions = this.formattedLineOptions.filter(v => v.name && v.name.toLowerCase().indexOf(needle) > -1)
      })
    },

    getSelectedLineLabel () {
      if (!this.selectedLine && Object.keys(this.selectedLine).length < 1) {
        return 'Select line...'
      }
      const title = this.incomingNumber ? this.$options.filters.fixPhone(this.incomingNumber.phone_number) : ''
      const titleText = title && title.length > 0 ? `<i class="fa fa-circle selected-option-separator"></i> <span class="selected-option-title">${title}</span>` : ''
      return `<span class="selected-option">${this.selectedLine.name}</span> ${titleText}`
    },

    getIncomingNumber () {
      this.isBusy = true

      let apiCall
      if (this.teamInbox) {
        apiCall = talk2TeamInboxApi.contact.getIncomingNumber(this.contact.id, this.selectedLine.id)
      } else {
        apiCall = talk2Api.V1.contact.getLineIncomingNumber(this.contact.id, this.selectedLine.id)
      }

      return apiCall.then(response => {
        this.incomingNumber = response.data
      }).finally(() => {
        this.isBusy = false
      })
    },

    setDefaultLine () {
      this.selectedLine = this.selectedCampaign
      if (this.selectedLine && this.contact.id) {
        this.getIncomingNumber()
      }
    },

    setIncomingNumber () {
      this.selectedLine = this.selectedCampaign
      this.incomingNumber = this.lineIncomingNumber
      this.showPlaceholder()
    },

    updateMessageComposer () {
      if (this.selectedCampaign && this.selectedCampaign.id && this.contact && this.contact.id) {
        this.checkEmailCapability()
      }
    },

    /**
     * Override checkEmailCapability from contactMixin to use our selectedCampaign
     */
    checkEmailCapability () {
      const mailIntegrationEnabled = this.currentCompany.sendgrid_integration_enabled || this.currentCompany.mailgun_integration_enabled

      if (this.currentCompany && mailIntegrationEnabled) {
        this.canEmail = true
        return
      }

      this.canEmail = this.selectedCampaign.email_intake && this.selectedCampaign.email_intake_route_id
    },

    /**
     * Override updateLineIncomingNumber from contactMixin to use our selectedCampaign
     */
    updateLineIncomingNumber () {
      if (this.contact && this.contact.id && !_.isEmpty(this.selectedCampaign)) {
        this.setLineIncomingNumberLoading(true)

        let apiCall
        if (this.teamInbox) {
          apiCall = talk2TeamInboxApi.contact.getIncomingNumber(this.contact.id, this.selectedCampaign.id)
        } else {
          apiCall = talk2Api.V1.contact.getLineIncomingNumber(this.contact.id, this.selectedCampaign.id)
        }

        apiCall.then(response => {
          this.setLineIncomingNumber(response.data)
        }).finally(() => {
          this.setLineIncomingNumberLoading(false)
        })
      }
    }
  },

  watch: {
    'contact.id': function (value) {
      if (this.contact && this.contact.id) {
        this.setDefaultLine(value)
        this.showPlaceholder()
      }
    },
    'selectedLine': function (value) {
      this.$emit('change', value)
    },
    'campaignId': function (value) {
      if (value && this.contact && this.contact.id) {
        this.setDefaultLine()
        this.showPlaceholder()
      }
    },
    'campaignsToUse': {
      handler: function (newCampaigns) {
        if (newCampaigns?.length > 0 && this.campaignId && this.contact?.id) {
          if (!this.selectedLine) {
            this.setDefaultLine()
          }
        }
      },
      immediate: true
    },
    lineIncomingNumberLoading (value) {
      this.isBusy = value
    },
    lineIncomingNumber: {
      deep: true,
      handler: function (value) {
        this.setIncomingNumber()
      }
    }
  }
}
</script>
