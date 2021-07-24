<template>
  <div class="row no-wrap q-pa-md width-290">
    <div class="col no-padding max-width-266">
      <line-selector v-model="campaignId"
                     @change="changeCampaignId">
      </line-selector>

      <div class="tab-links d-inline-flex w-100">
        <b-link href="#"
                :class="{ active : mode === 'call' }"
                @click="setMode('call')">
          Call
        </b-link>
        <b-link href="#"
                :class="{ active : mode === 'text' }"
                @click="setMode('text')">
          Text
        </b-link>
      </div>
      <div class="d-inline-flex align-items-end justify-content-between dialer w-100 pb-2">
        <b-form-group :label="label"
                      :invalid-feedback="invalidPhoneNumber"
                      :state="validPhoneNumber"
                      class="mt-2 mb-0">
          <contact-phone-number-search v-model="phoneNumber"
                                       @change="changePhoneNumber">
          </contact-phone-number-search>
        </b-form-group>
        <q-btn :ripple="true"
               :disable="sendDisabled"
               v-show="mode == 'call'"
               icon="img:app-icons/dialer/call_btn_small.svg"
               size="36px"
               class="icon-btn auto-size height-36"
               align="right"
               padding="none"
               rounded
               flat>
        </q-btn>
        <q-btn :ripple="true"
               :disable="sendDisabled"
               v-show="mode == 'text'"
               icon="img:app-icons/dialer/text_btn_small.svg"
               size="36px"
               class="icon-btn auto-size height-36"
               align="right"
               padding="none"
               rounded
               flat>
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import ContactPhoneNumberSearch from 'components/dialer/contact-phone-number-search'
import LineSelector from 'components/dialer/line-selector'
import * as UserOutboundCallingModes from 'src/constants/user-outbound-calling-modes'

export default {
  name: 'dialer.vue',

  components: { ContactPhoneNumberSearch, LineSelector },

  props: {
    value: {
      type: Boolean,
      required: false
    }
  },

  data () {
    return {
      label: 'Call a number',
      mode: 'call',
      defaultOutboundCampaignId: null,
      campaignId: null,
      phoneNumber: ''
    }
  },

  computed: {
    ...mapState(['currentCompany']),
    ...mapGetters('auth', ['user']),

    validPhoneNumber () {
      return this.$options.filters.fixPhone(this.phoneNumber) !== false
    },

    invalidPhoneNumber () {
      return 'Please enter a valid phone number'
    },

    sendDisabled () {
      return !this.validPhoneNumber || !this.phoneNumber.length || !this.campaignId
    }
  },

  mounted () {
    if (this.value) {
      this.showDialer()
    } else {
      this.hideDialer()
    }
  },

  methods: {
    showDialer () {
      // find default outbound campaign
      this.findDefaultOutboundCampaign()
      this.$emit('show')
    },

    hideDialer () {
      this.resetForm()
      this.$emit('hide')
    },

    resetForm () {
      this.phoneNumber = ''
      this.defaultOutboundCampaignId = null
      this.campaignId = null
      this.label = 'Call a number'
      this.mode = 'call'
    },

    changePhoneNumber (phoneNumber) {
      this.phoneNumber = phoneNumber
    },

    changeCampaignId (campaignId) {
      this.campaignId = campaignId
    },

    findDefaultOutboundCampaign () {
      this.campaignId = null
      this.defaultOutboundCampaignId = null

      // force outbound line on all users
      if (this.currentCompany && this.currentCompany.default_outbound_campaign_id && this.currentCompany.force_outbound_line) {
        this.defaultOutboundCampaignId = this.currentCompany.default_outbound_campaign_id
        this.campaignId = this.defaultOutboundCampaignId
        return
      }

      // outbound line is set to use account default and account has a default
      if (this.currentCompany && this.currentCompany.default_outbound_campaign_id && this.user.profile && this.user.profile.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_DEFAULT && !this.user.profile.default_outbound_campaign_id) {
        this.defaultOutboundCampaignId = this.currentCompany.default_outbound_campaign_id
        this.campaignId = this.defaultOutboundCampaignId
        return
      }

      // user has a default outbound line
      if (this.user.profile && this.user.profile.default_outbound_campaign_id && this.user.profile.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_DEFAULT) {
        this.defaultOutboundCampaignId = this.user.profile.default_outbound_campaign_id
        this.campaignId = this.defaultOutboundCampaignId
        return
      }

      // user has to choose outbound line every time
      if (this.user.profile && this.user.profile.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_ALWAYS_ASK) {
        this.defaultOutboundCampaignId = null
        this.campaignId = null
      }
    },

    setMode (mode) {
      this.mode = mode
      switch (mode) {
        case 'call':
          this.label = 'Call a number'
          break
        case 'text':
          this.label = 'Text a number'
          break
      }
    }
  },

  watch: {
    value () {
      if (this.value) {
        this.showDialer()
      } else {
        this.hideDialer()
      }
    }
  }
}
</script>
