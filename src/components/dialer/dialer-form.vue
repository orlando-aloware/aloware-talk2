<template>
  <div class="row no-wrap pt-3 pb-3 width-380"
       :class="{ 'loading-cover-screen': isMakingCall }">
    <div class="loading-container"
         v-if="isMakingCall">
      <div class="mobile-call-loader">
        <q-spinner-bars
          color="white"
          size="5em"
        />
      </div>
    </div>
    <div v-if="!isMakingCall"
         class="col no-padding">
      <b-tabs class="dialer-tabs"
              pills
              vertical>
        <b-tab :active="mode === 'call'"
               title="Call"
               @click="setMode('call')">
          <b-form-group :invalid-feedback="invalidCampaign"
                        :state="validCampaign"
                        class="mb-1">
            <line-selector class="line-selector"
                           :disable="defaultOutboundCampaignId && mode === 'call'"
                           :generic-multiselect="false"
                           prepend="From:"
                           v-model="campaignId"
                           @change="changeCampaignId">
            </line-selector>
          </b-form-group>
          <div class="d-inline-flex align-items-center justify-content-between dialer w-100"
               v-if="mode === 'call'">
            <b-form-group :invalid-feedback="invalidPhoneNumber"
                          :state="validPhoneNumber"
                          class="mb-0">
              <contact-phone-number-search :no_prepend="true"
                                           class="width-190"
                                           v-model="phoneNumber"
                                           ref="callContactPhoneNumberSearch"
                                           @change="changePhoneNumber"
                                           @keyup.enter.native="makeCall">
              </contact-phone-number-search>
            </b-form-group>
            <q-btn :ripple="true"
                   :disable="callDisabled"
                   icon="img:app-icons/dialer/call_btn.svg"
                   size="32px"
                   class="icon-btn auto-size height-32"
                   align="right"
                   padding="none"
                   rounded
                   flat
                   @click="makeCall">
            </q-btn>
          </div>

          <div class="dialer-contact-info width-190">
            <div class="text-size-sm text-grey-80 _400 mb-0 d-flex justify-content-between"
                 v-if="contactId">
              <div class="d-inline-flex text-left">{{ isMobile ? contactName : $options.filters.truncate(contactName, 15) }}</div>
              <div class="d-inline-flex text-right"
                   v-if="currentLocalTime">
                ~{{ currentLocalTime }}
              </div>
            </div>
            <p class="text-size-sm text-grey-80 _400 mb-1"
               v-if="contactId && companyName">
              {{ companyName }}
            </p>
            <div v-if="!contactId && validPhoneNumber && phoneNumber && !loadingContact">
              <span class="text-size-sm text-grey-80 _400">New number</span>
            </div>
          </div>
        </b-tab>
        <b-tab :active="mode === 'text'"
               title="Message"
               @click="setMode('text')">
          <b-form-group :invalid-feedback="invalidCampaign"
                        :state="validCampaign"
                        class="mb-1">
            <line-selector class="line-selector"
                           v-model="campaignId"
                           prepend="From:"
                           :generic-multiselect="false"
                           @change="changeCampaignId">
            </line-selector>
          </b-form-group>
          <div class="d-inline-flex align-items-end justify-content-between dialer w-100"
               v-if="mode === 'text'">
            <b-form-group :invalid-feedback="invalidPhoneNumber"
                          :state="validPhoneNumber"
                          class="mb-0 w-100">
              <contact-phone-number-search v-model="phoneNumber"
                                           ref="textContactPhoneNumberSearch"
                                           @change="changePhoneNumber"
                                           @keyup.enter.native="sendText">
              </contact-phone-number-search>
            </b-form-group>
          </div>

          <div class="dialer-contact-info w-100">
            <div class="text-size-sm text-grey-80 _400 mb-0 d-flex justify-content-between"
                 v-if="contactId">
              <div class="d-inline-flex text-left">{{ isMobile ? contactName : $options.filters.truncate(contactName, 15) }}</div>
              <div class="d-inline-flex text-right"
                   v-if="currentLocalTime">
                ~{{ currentLocalTime }}
              </div>
            </div>
            <p class="text-size-sm text-grey-80 _400 mb-1"
               v-if="contactId && companyName">
              {{ companyName }}
            </p>
            <div v-if="!contactId && validPhoneNumber && phoneNumber && !loadingContact">
              <span class="text-size-sm text-grey-80 _400">New number</span>
            </div>
          </div>

          <div class="mobile-message-composer mb-2">
            <b-input-group>
              <template #append>
                <b-input-group-text class="bg-white border-left-0 align-items-end">
                  <q-btn :disable="sendDisabled"
                         :ripple="false"
                         class="height-16 no-q-btn-focus"
                         padding="none"
                         flat
                         @click="sendText">
                    <send-text-icon :width="isMobile ? 18 : 16"
                                    :height="isMobile ? 18: 16"
                                    :color="sendTextColor">
                    </send-text-icon>
                  </q-btn>
                </b-input-group-text>
              </template>
              <b-form-textarea class="textarea-no-auto-shrink text-size-sm _400 border-right-0 overflow-hidden pl-2 pr-2 border-half-rounded"
                               placeholder="Text Message..."
                               rows="2"
                               max-rows="3"
                               no-auto-shrink
                               no-resize
                               v-model="textMessage">
              </b-form-textarea>
            </b-input-group>
          </div>
        </b-tab>
      </b-tabs>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import ContactPhoneNumberSearch from 'components/dialer/contact-phone-number-search'
import LineSelector from 'components/generic-selectors/line-selector'
import contactMixins from 'src/plugins/mixins/contact.mixin'
import SendTextIcon from 'components/icons/send-text-icon'
import * as UserOutboundCallingModes from 'src/constants/user-outbound-calling-modes'

export default {
  name: 'dialer-form',

  mixins: [contactMixins],

  components: {
    ContactPhoneNumberSearch,
    LineSelector,
    SendTextIcon
  },

  props: {
    value: {
      type: Boolean,
      required: false
    },
    isMobile: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  data () {
    return {
      mode: 'call',
      defaultOutboundCampaignId: null,
      campaignId: null,
      phoneNumber: '',
      contactName: '',
      companyName: '',
      contactId: null,
      contactTimezone: null,
      currentLocalTime: null,
      loadingContact: false,
      textMessage: '',
      isMakingCall: false
    }
  },

  computed: {
    ...mapState(['currentCompany', 'dialer']),
    ...mapGetters('auth', ['profile']),

    sendTextColor () {
      return this.sendDisabled ? '#D8D8D8' : '#256EFF'
    },

    validPhoneNumber () {
      return this.$options.filters.fixPhone(this.phoneNumber) !== false
    },

    invalidPhoneNumber () {
      return 'Please enter a valid phone number'
    },

    validCampaign () {
      return this.campaignId !== null
    },

    invalidCampaign () {
      return 'Please select a line'
    },

    callDisabled () {
      return !this.validPhoneNumber || !this.phoneNumber.length || !this.campaignId
    },

    sendDisabled () {
      return !this.validPhoneNumber || !this.phoneNumber.length || !this.campaignId || !this.textMessage
    }
  },

  created () {
    this.$VueEvent.listen('changePhoneNumber', (data) => {
      this.setMode('call')
      this.changePhoneNumber(data).then(() => {
        this.makeCall()
      })
    })
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
      this.$emit('hide')
      this.resetForm()
    },

    resetForm () {
      this.phoneNumber = ''
      this.contactName = ''
      this.companyName = ''
      this.contactId = null
      this.contactTimezone = null
      if (!this.isMobile) {
        this.defaultOutboundCampaignId = null
        this.campaignId = null
      }
      this.mode = 'call'
      this.textMessage = ''
    },

    async changePhoneNumber (data) {
      this.phoneNumber = data.currentNumber
      this.contactName = data.contactName
      this.companyName = data.companyName
      this.contactId = data.contactId
      this.contactTimezone = data.contactTimezone

      if (!this.contactId) {
        this.loadingContact = true
        await this.getContactByPhoneNumber(this.phoneNumber).then((data) => {
          this.contactName = data.name
          this.companyName = data.company_name
          this.contactId = data.id
          this.contactTimezone = data.timezone
          this.loadingContact = false
        }).catch((err) => {
          console.log(err)
          this.loadingContact = false
        })
      }

      this.setupContactLocalTime()
    },

    setupContactLocalTime () {
      if (this.contactTimezone) {
        this.getContactLocalTime()
        this.$options.localTimeInterval = setInterval(this.getContactLocalTime, 60 * 1000)
      }
    },

    hideLocalTime () {
      this.showLocalTime = false
    },

    getContactLocalTime () {
      if (this.contactTimezone) {
        this.currentLocalTime = this.$moment.utc().tz(this.contactTimezone).format('h:mm a')
      }
    },

    changeCampaignId (campaignId) {
      this.campaignId = campaignId
    },

    findDefaultOutboundCampaign () {
      this.campaignId = null
      this.defaultOutboundCampaignId = null

      // 1. [Account level] force outbound line on all users
      if (this.currentCompany && this.currentCompany.force_outbound_line) {
        this.defaultOutboundCampaignId = this.currentCompany.default_outbound_campaign_id
        this.campaignId = this.defaultOutboundCampaignId
        return
      }

      // 2. [User level] Outbound line is set to follow account default
      if (this.currentCompany && this.profile && this.profile.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_DEFAULT && !this.profile.default_outbound_campaign_id) {
        this.defaultOutboundCampaignId = this.currentCompany.default_outbound_campaign_id
        this.campaignId = this.defaultOutboundCampaignId
        return
      }

      // 3. [User level] user has a default outbound line
      if (this.profile && this.profile.default_outbound_campaign_id && this.profile.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_DEFAULT) {
        this.defaultOutboundCampaignId = this.profile.default_outbound_campaign_id
        this.campaignId = this.defaultOutboundCampaignId
      }

      // 4. We couldn't find anything
    },

    setMode (mode) {
      this.mode = mode
    },

    makeCall () {
      if (this.callDisabled) {
        return
      }

      let data = {
        currentNumber: this.$options.filters.fixPhone(this.phoneNumber),
        outboundCampaignId: this.campaignId,
        contactName: this.contactName,
        companyName: this.companyName,
        contactId: this.contactId
      }
      this.$VueEvent.fire('makeCall', data)
      if (!this.isMobile) {
        this.hideDialer()
      }
      if (this.isMobile) {
        this.isMakingCall = true
      }
    },

    sendText () {
      if (this.sendDisabled) {
        return
      }

      this.loading_btn = true
      this.$axios.post('/api/v1/campaign/send-message-to-phone-number/' + this.campaignId, {
        phone_number: this.$options.filters.fixPhone(this.phoneNumber),
        message: this.textMessage
      }).then(res => {
        this.loading_btn = false
        this.hideDialer()
        if (!this.isMobile) {
          this.$router.push({
            name: 'Contact',
            params: {
              id: res.data.id
            }
          }).catch(err => {
            console.log(err)
          })
        }
      }).catch(err => {
        this.loading_btn = false
        this.$handleErrors(err.response)
      })
    },

    resetSMS () {
      this.sms = {
        campaign_id: null,
        phone_number: null,
        message: null
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
    },

    selected () {
      this.resetSelectorId()
    },

    'dialer.currentStatus': function () {
      if (!this.dialer.currentStatus || (this.dialer.currentStatus && this.dialer.currentStatus === 'READY')) {
        this.isMakingCall = false
      }
    }
  },

  beforeDestroy () {
    this.$VueEvent.stop('changePhoneNumber')
    clearInterval(this.$options.localTimeInterval)
  }
}
</script>
