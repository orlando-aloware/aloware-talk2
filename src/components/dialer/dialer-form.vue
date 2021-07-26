<template>
  <div class="row no-wrap q-pa-md width-380">
    <div class="col no-padding">
      <b-tabs class="dialer-tabs"
              pills
              vertical>
        <b-tab :active="mode === 'call'"
               title="Call"
               @click="setMode('call')">
          <div class="d-inline-flex align-items-end justify-content-between dialer w-100 pb-4">
            <b-form-group :invalid-feedback="invalidPhoneNumber"
                          :state="validPhoneNumber"
                          label="Call a number"
                          class="mb-0">
              <contact-phone-number-search v-model="phoneNumber"
                                           ref="callContactPhoneNumberSearch"
                                           @change="changePhoneNumber">
              </contact-phone-number-search>
            </b-form-group>
            <q-btn :ripple="true"
                   :disable="callDisabled"
                   icon="img:app-icons/dialer/call_btn.svg"
                   size="36px"
                   class="icon-btn auto-size height-36"
                   align="right"
                   padding="none"
                   rounded
                   flat
                   @click="makeCall">
            </q-btn>
          </div>

          <b-form-group :invalid-feedback="invalidCampaign"
                        :state="validCampaign"
                        class="mb-1">
            <line-selector :disable="this.defaultOutboundCampaignId && mode === 'call'"
                           v-model="campaignId"
                           @change="changeCampaignId">
            </line-selector>
          </b-form-group>
        </b-tab>
        <b-tab :active="mode === 'text'"
               title="Text"
               @click="setMode('text')">
          <div class="d-inline-flex align-items-end justify-content-between dialer w-100 pb-4">
            <b-form-group :invalid-feedback="invalidPhoneNumber"
                          :state="validPhoneNumber"
                          label="Text a number"
                          class="mb-0">
              <contact-phone-number-search v-model="phoneNumber"
                                           ref="textContactPhoneNumberSearch"
                                           @change="changePhoneNumber">
              </contact-phone-number-search>
            </b-form-group>
            <q-btn :ripple="true"
                   :disable="sendDisabled"
                   icon="img:app-icons/dialer/text_btn.svg"
                   size="36px"
                   class="icon-btn auto-size height-36"
                   align="right"
                   padding="none"
                   rounded
                   flat
                   @click="sendText">
            </q-btn>
          </div>

          <b-form-group :invalid-feedback="invalidCampaign"
                        :state="validCampaign"
                        class="mb-1">
            <line-selector :disable="this.defaultOutboundCampaignId && mode === 'call'"
                           v-model="campaignId"
                           @change="changeCampaignId">
            </line-selector>
          </b-form-group>
        </b-tab>
      </b-tabs>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import ContactPhoneNumberSearch from 'components/dialer/contact-phone-number-search'
import LineSelector from 'components/dialer/line-selector'
import contactMixins from 'src/plugins/mixins/contact.mixin'
import * as UserOutboundCallingModes from 'src/constants/user-outbound-calling-modes'

export default {
  name: 'dialer-form',

  mixins: [contactMixins],

  components: { ContactPhoneNumberSearch, LineSelector },

  props: {
    value: {
      type: Boolean,
      required: false
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
      contactId: null
    }
  },

  computed: {
    ...mapState(['currentCompany']),
    ...mapGetters('auth', ['profile']),

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
      return !this.validPhoneNumber || !this.phoneNumber.length || !this.campaignId
    }
  },

  created () {
    this.$VueEvent.listen('changePhoneNumber', (data) => {
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
      this.defaultOutboundCampaignId = null
      this.campaignId = null
      this.label = 'Call a number'
      this.mode = 'call'
    },

    async changePhoneNumber (data) {
      this.phoneNumber = data.currentNumber
      this.contactName = data.contactName
      this.companyName = data.companyName
      this.contactId = data.contactId

      if (!this.contactId) {
        await this.getContactByPhoneNumber(this.phoneNumber).then((data) => {
          this.contactName = data.name
          this.companyName = data.company_name
          this.contactId = data.id
        }).catch((err) => {
          console.log(err)
        })
      }
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
      if (this.currentCompany && this.currentCompany.default_outbound_campaign_id && this.profile && this.profile.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_DEFAULT && !this.profile.default_outbound_campaign_id) {
        this.defaultOutboundCampaignId = this.currentCompany.default_outbound_campaign_id
        this.campaignId = this.defaultOutboundCampaignId
        return
      }

      // user has a default outbound line
      if (this.profile && this.profile.default_outbound_campaign_id && this.profile.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_DEFAULT) {
        this.defaultOutboundCampaignId = this.profile.default_outbound_campaign_id
        this.campaignId = this.defaultOutboundCampaignId
        return
      }

      // user has to choose outbound line every time
      if (this.profile && this.profile.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_ALWAYS_ASK) {
        this.defaultOutboundCampaignId = null
        this.campaignId = null
      }
    },

    setMode (mode) {
      this.mode = mode
      switch (mode) {
        case 'call':
          this.$refs.callContactPhoneNumberSearch.focusInput()
          break
        case 'text':
          this.$refs.textContactPhoneNumberSearch.focusInput()
          break
      }
    },

    makeCall () {
      if (!this.validPhoneNumber || !this.campaignId) {
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
      this.hideDialer()
    },

    sendText () {
      if (!this.validPhoneNumber) {
        return
      }

      if (this.contactId) {
        this.$router.push({
          name: 'Contact',
          params: {
            id: this.contactId,
            campaignId: this.outboundCampaignId
          }
        }).catch(err => {
          console.log(err)
        })
      } else {
        this.addContactByPhoneNumber(this.phoneNumber).then((data) => {
          this.$router.push({
            name: 'Contact',
            params: {
              id: data.id,
              campaignId: this.outboundCampaignId
            }
          }).catch(err => {
            console.log(err)
          })
        })
      }
    }
  },

  beforeDestroy () {
    this.$VueEvent.stop('changePhoneNumber')
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
