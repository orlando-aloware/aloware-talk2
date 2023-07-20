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
              @popup-show="onShowMenu"
              @focus="onFocus"
              @blur="onBlur"
              @input="onInput"
              @filter="filterLineFn">
      <template v-slot:option="scope">
        <q-item v-if="!scope.opt.group"
                v-bind="scope.itemProps"
                v-on="scope.itemEvents"
                v-close-popup>
          <q-item-section>
            <q-item-label v-html="scope.opt.name"></q-item-label>
          </q-item-section>
          <q-item-section v-if="isMessagingBlocked(scope.opt, checkBlockedMessaging)" side>
            <q-badge color="red">!</q-badge>
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
import { mapGetters, mapState } from 'vuex'
import {
  contactMixin,
  contactV2AttributesMixin,
  aclMixin,
  visibilityMixin,
  selectorMixin
} from 'src/plugins/mixins'
import talk2Api from 'src/plugins/api/api'

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
    }
  },

  computed: {
    ...mapGetters('contacts', ['contact']),
    ...mapState('contacts', [
      'lineIncomingNumberLoading',
      'lineIncomingNumber'
    ]),
    ...mapState(['campaigns']),

    selectedCampaign () {
      if (this.campaigns) {
        return this.campaigns.find(campaign => campaign.id === this.campaignId)
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
    }
  },

  data () {
    return {
      isBusy: false,
      selectedLine: null,
      lineOptions: this.formattedLineOptions,
      incomingNumber: null,
      isFocused: false,
      selectWidth: 0
    }
  },

  mounted () {
    if (this.contact && this.contact.id) {
      this.lineOptions = this.formattedLineOptions
      this.setIncomingNumber()
    }
  },

  methods: {
    onShowMenu () {
      this.selectWidth = this.$refs.lineSelector.$el.offsetWidth
    },
    onFocus () {
      this.isFocused = true
      this.$el.querySelector('.inline-select .q-field__input').placeholder = this.selectedLine ? this.selectedLine.name : 'Select line'
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

    showPlaceholder () {
      if (!this.selectedLine) {
        this.$el.querySelector('.inline-select .q-field__input').placeholder = 'Select line'
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
      return talk2Api.V1.contact.getLineIncomingNumber(this.contact.id, this.selectedLine.id).then(response => {
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
