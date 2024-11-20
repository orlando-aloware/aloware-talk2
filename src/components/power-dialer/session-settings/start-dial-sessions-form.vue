<template>
  <q-card class="row"
          v-if="resources">
    <div class="label mb-1 text-weight-bold text-subtitle1 pl-3 py-2">
      Basics
    </div>
    <div class="pb-4 dial-sessions__form">
      <div class="row">
        <div class="col-6 pl-3">
          <label class="label mb-1">
            Line
          </label>
          <line-selector :multiple="false"
                        :use-chips="true"
                        :disable="disabled"
                        :generic-styling="false"
                        :generic-multiselect="false"
                        :force-remove-missing-values="true"
                        v-model="resources.campaign_id"
                        @change="(eventPayload) => onSettingsChange(eventPayload, 'campaign_id')"/>
        </div>

        <div class="col-6 mb-4">
          <div>
            <label class="label mb-1">
              Skip Outside Daytime Hours
            </label>
            <span class="ml-1 cursor-pointer">
              <information-circle-icon color="#2F80ED"/>
              <q-tooltip anchor="top middle"
                         self="center middle">
                You can skip contacts that are in a timezone outside the daytime hours
              </q-tooltip>
            </span>
          </div>
          <q-toggle size="md"
                    val="md"
                    :true-value="1"
                    :false-value="0"
                    :disable="disabled"
                    v-model="resources.skip_outside_daytime_hours" />
        </div>
    </div>

      <div class="row">
        <div class="col-6 pl-3">
          <label class="label mb-1">
            Warmup Period
          </label>
          <warmup-period-selector class="dial-sessions__form__warmup-period-selector"
                                  :disable="disabled"
                                  v-model="resources.warmup_period_in_seconds"
                                  @change="(eventPayload) => onSettingsChange(eventPayload, 'warmup_period_in_seconds')"/>
        </div>

        <div class="col-6 pl-3">
          <label class="label mb-1">
            Phone Script
          </label>
          <script-selector class="w-100 dial-sessions__form__script-selector"
                            :class="[resources.script_id ? 'populated': '']"
                            :disable="disabled"
                            :clearable="true"
                            v-model="resources.script_id"
                            @change="(eventPayload) => onSettingsChange(eventPayload, 'script_id')"/>
        </div>

        <div class="col-6 pl-3">
          <label class="label mb-1">
            Order by
          </label>
          <session-order-selector class="generic-selector-2 dial-sessions__form__order-selector"
                                  v-model="resources.order"
                                  @change="(eventPayload) => onSettingsChange(eventPayload, 'order')"/>
        </div>
      </div>

      <div class="label mt-3 mb-2 text-weight-bold text-subtitle1 pl-3 py-2">
        Redial Settings
      </div>

      <div class="col-12 pl-3 mb-4">
        <div :class="disableField('min_redials') ? 'opacity-05' : ''">
          <label class="label mb-1 text-weight-bold">
            Minimum Number of Redials
          </label>
          <div>Choose how many times a contact has to be redialed until a successful call disposition is achieved</div>
        </div>
        <q-select class="mt-2 q-select-pager"
                  option-value="value"
                  option-label="label"
                  outlined
                  dense
                  emit-value
                  data-testid="datatable-per-page-select"
                  :disable="disableField('min_redials')"
                  :options="minRedialOptions"
                  :display-value="resources.min_redials === 0 ? '0 (No redial required)' : `${resources.min_redials} time${resources.min_redials > 1 ? 's' : ''}`"
                  v-model="resources.min_redials" />
      </div>

      <div class="col-12 mb-4"
          v-show="resources.min_redials > 0">
        <div class="d-flex items-center justify-between">
          <div :class="disableField('force_immediate_redial') ? 'opacity-05' : ''">
            <label class="label mb-1 text-weight-bold">
              Force Immediate Redial
            </label>
            <div>Immediately redial the contact, instead of pushing it to the bottom</div>
          </div>
          <q-toggle size="md"
                    val="md"
                    :true-value="1"
                    :false-value="0"
                    :disable="disableField('force_immediate_redial')"
                    v-model="resources.force_immediate_redial" />
        </div>
      </div>

      <div class="col-12 mb-4"
           v-show="resources.min_redials > 0">
        <div class="d-flex items-center justify-between">
          <div :class="disableField('force_sms') ? 'opacity-05' : ''">
            <label class="label mb-1 text-weight-bold">
              Force SMS Sending on Unsuccessful Calls
            </label>
            <div>Request sending a SMS if the selected call disposition is not a Successful Call Disposition</div>
          </div>
          <q-toggle size="md"
                    val="md"
                    :true-value="1"
                    :false-value="0"
                    :disable="disableField('force_sms')"
                    v-model="resources.force_sms" />
        </div>
      </div>

      <div class="col-12 pl-3 mb-4"
          v-show="resources.min_redials > 0">
        <div :class="disableField('successful_call_disposition_ids') ? 'opacity-05' : ''">
          <label class="label mb-1 text-weight-bold">
            Select Successful Call Dispositions
          </label>
          <div>Select the dispositions that won't require the contact to be redialed, meaning that the call was successfully answered</div>
        </div>
        <call-disposition-selector class="p-0 mt-1 dial-sessions__form__call-disposition-selector"
                                    :multiple="true"
                                    :highlighted="false"
                                    v-model="resources.successful_call_disposition_ids"
                                    :disable="disableField('successful_call_disposition_ids')"
                                    @change="onSuccessfulCallDispositionsChange"/>
      </div>

      <div class="label mt-4 mb-1 text-weight-bold text-subtitle1 pl-3 py-2">
        Customizations
      </div>

      <div class="row">
        <div class="col-6 pl-3">
          <label class="label mb-1">
            Set Call Disposition Shortcuts
          </label>
          <call-disposition-selector class="pb-2 dial-sessions__form__call-disposition-selector"
                                      :multiple="true"
                                      :highlighted="isChanged('call_dispositions')"
                                      :disable="disabled"
                                      v-model="resources.call_disposition_ids"
                                      @change="(eventPayload) => onSettingsChange(eventPayload, 'call_disposition_ids')"/>
        </div>

        <div class="col-6 pl-3">
          <label class="label mb-1">
            Set Contact Disposition Shortcuts
          </label>
          <contact-disposition-selector class="pb-2 dial-sessions__form__contact-disposition-selector"
                                        custom-class="padded-container-1 generic-selector-1"
                                        :generic-styling="false"
                                        :multiple="true"
                                        :use-chips="true"
                                        :outlined="true"
                                        :disable="disabled"
                                        :show-placeholder="true"
                                        v-model="resources.contact_disposition_ids"
                                        @change="(eventPayload) => onSettingsChange(eventPayload, 'contact_disposition_ids')"/>
        </div>

        <div class="col-6 pl-3">
          <label class="label mb-1">
            Set Session Metrics
          </label>
          <q-select class="generic-selector-2 dial-sessions__form__metric-options"
                    option-value="value"
                    option-label="label"
                    multiple
                    use-chips
                    use-input
                    emit-value
                    map-options
                    outlined
                    dense
                    :options="metrics"
                    :disable="disabled"
                    :max-values="4"
                    :placeholder="resources.metric_options?.length > 0 ? '' : 'Select session metrics'"
                    v-model="resources.metric_options">
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps"
                      v-on="scope.itemEvents">
                <q-item-section>
                  <q-item-label class="text-subtitle2 font-weight-bold"
                                disabled
                                v-if="!scope.opt.value"
                                v-html="`${scope.opt.label}`" />
                  <q-item-label v-else
                                v-html="`&nbsp;&nbsp;  ${scope.opt.label}`" />
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <div class="col-6 pl-3">
          <label class="label mb-1">
            Set VM Drop Shortcuts
          </label>
          <vm-drop-selector class="w-100 dial-sessions__form__vm-drop-selector"
                            :use-chips="true"
                            :multiple="true"
                            :show-placeholder="true"
                            :disable="disabled"
                            v-model="resources.vm_drop_ids"
                            @change="(eventPayload) => onSettingsChange(eventPayload, 'vm_drop_ids')"/>
        </div>
      </div>
    </div>
  </q-card>
</template>

<script>
import { mapFields } from 'vuex-map-fields'
import { mapState, mapGetters, mapActions } from 'vuex'
import WarmupPeriodSelector from 'components/generic-selectors/warmup-period-selector'
import LineSelector from 'components/generic-selectors/line-selector'
import ScriptSelector from 'components/generic-selectors/session-scripts-selector'
import CallDispositionSelector from 'components/generic-selectors/call-disposition-selector'
import ContactDispositionSelector from 'components/generic-selectors/contact-disposition-selector'
import VmDropSelector from 'components/generic-selectors/vm-drop-selector'
import SessionOrderSelector from 'components/generic-selectors/session-order-selector.vue'
import { DEFAULT_SETTING_VALUES } from 'src/constants/power-dialer/forms'
import { WARM_UP_PERIOD_LIST } from 'src/constants/power-dialer/power-dialer-list'
import InformationCircleIcon from 'components/icons/information-circle-icon'

export default {
  name: 'StartDialSessionsForm',

  props: {
    settings: {
      type: Object,
      default: () => {
        return {
          skip_outside_daytime_hours: 1
        }
      }
    },

    name: {
      type: String,
      default: ''
    },

    disabled: {
      type: Boolean,
      default: false
    },

    flagged: {
      type: Boolean,
      default: false
    }
  },

  components: {
    WarmupPeriodSelector,
    LineSelector,
    ScriptSelector,
    ContactDispositionSelector,
    VmDropSelector,
    CallDispositionSelector,
    SessionOrderSelector,
    InformationCircleIcon
  },

  data () {
    return {
      selectWidth: 0,
      resources: this.settings
    }
  },

  computed: {
    ...mapFields('powerDialer', [
      'metrics'
    ]),

    ...mapState('inbox', [
      'channelChangedFilterFields'
    ]),

    ...mapGetters('contacts', [
      'contact'
    ]),

    ...mapGetters('powerDialer', [
      'defaultSettings',
      'sessionSettings'
    ]),

    ...mapState('cache', [
      'currentCompany'
    ]),

    warmUpPeriods () {
      let values = []
      values = [WARM_UP_PERIOD_LIST]

      for (let i = 1; i <= 10; i++) {
        values.push(`${i * 5} seconds`)
      }

      return values
    },

    defaultValues () {
      return DEFAULT_SETTING_VALUES
    },

    minRedialOptions () {
      const options = [
        { value: 0, label: '0 (No redial required)' },
        ...Array(10).fill(0).map((_, index) => ({ value: index + 1, label: `${index + 1} time${(index + 1) > 1 ? 's' : ''}` }))
      ]
      return options
    }
  },

  methods: {
    ...mapActions('powerDialer', [
      'setDefaultSettings',
      'getSessionMetricsOptions'
    ]),

    onSettingsChange (value, prop) {
      if (Array.isArray(value)) {
        this.resources[prop] = value.map(item => this.$isNumeric(item) ? item : item.id)
        return
      }

      this.resources[prop] = value
    },

    isChanged (property) {
      let item = this.channelChangedFilterFields.find(item => item.property === property)
      return !!item
    },

    onShowMetricsMenu () {
      this.selectWidth = this.$refs.metric_options[0].$el.offsetWidth
    },

    onShowWarmUpMenu () {
      this.selectWidth = this.$refs.warmup_period_in_seconds[0].$el.offsetWidth
    },

    onSuccessfulCallDispositionsChange (eventPayload) {
      this.onSettingsChange(eventPayload, 'successful_call_disposition_ids')

      // if force redial is on, combine call disposition ids with selected successful call dispositions
      // since they are required in order to not force redial the contact
      if (this.resources.force_redial) {
        const successfulCallIds = eventPayload.filter(item => !this.resources.call_disposition_ids.includes(item))
        this.onSettingsChange([...this.resources.call_disposition_ids, ...successfulCallIds], 'call_disposition_ids')
      }
    },

    applyCompanyRedialSettings (value) {
      const powerDialerSettings = this.currentCompany?.power_dialer_settings ?? {}

      // if force redial is enabled
      if (powerDialerSettings.min_redials > 0) {
        value.min_redials = powerDialerSettings.min_redials
      }

      if (powerDialerSettings.force_immediate_redial) {
        value.force_immediate_redial = 1
      }

      if (powerDialerSettings.force_sms) {
        value.force_sms = 1
      }

      const settingsSuccessfulCallDispositionIds = powerDialerSettings.successful_call_disposition_ids

      // if company has successful call disposition settings, merge it to current dispositions
      if (settingsSuccessfulCallDispositionIds?.length) {
        value.successful_call_disposition_ids = settingsSuccessfulCallDispositionIds

        const companySuccessfulCallIds = settingsSuccessfulCallDispositionIds.filter(id => !value.call_disposition_ids.includes(id))
        value.call_disposition_ids = [...value.call_disposition_ids, ...companySuccessfulCallIds]
      }

      return value
    },

    disableField (field) {
      if (this.disabled) {
        return true
      }

      const powerDialerSettings = this.currentCompany?.power_dialer_settings ?? {}

      const redialRequired = powerDialerSettings.min_redials > 0

      switch (field) {
        case 'min_redials': return redialRequired
        case 'force_immediate_redial': return redialRequired && powerDialerSettings.force_immediate_redial
        case 'force_sms': return redialRequired && powerDialerSettings.force_sms
        case 'successful_call_disposition_ids': return redialRequired && powerDialerSettings.successful_call_disposition_ids?.length > 0
      }

      return false
    }
  },

  watch: {
    resources: {
      deep: true,
      handler (value) {
        this.setDefaultSettings(value)

        // check if campaign_id and warmup_period_in_seconds are not empty
        if (this.$isNumeric(value?.campaign_id) &&
          this.$isNumeric(value?.warmup_period_in_seconds)) {
          this.$emit('valid-form', true)
          this.$emit('updateSettings', value)

          return
        }

        this.$emit('invalid-form', true)
      }
    },

    settings (value) {
      console.log('this.currentCompany', this.currentCompany)

      this.applyCompanyRedialSettings(value)
      this.resources = value
    },

    flagged (value) {
      if (value) {
        this.resources.skip_outside_daytime_hours = 1
      }
    }
  }
}
</script>
