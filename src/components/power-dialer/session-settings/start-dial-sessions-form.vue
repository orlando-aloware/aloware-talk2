<template>
  <div class="row">
    <div
      class="col-12 px-0"
      v-for="form in forms"
      :key="form.name" >
      <label
        class="label mb-1 text-weight-bold text-subtitle1 pl-3 py-2">
        {{ form.label }}
      </label>
      <div
        class="row pb-4">
        <div
          v-for="cform in form.children"
          :key="cform.name"
          class="col-6 pl-3">
          <label
            class="label mb-1">
            {{ cform.label }}
            </label>

          <MetricSelector
            v-if="cform.name === 'metric_options'"
            v-model="resources[cform.name]"
            :options="metricOptions"
            :multiple="true"
            :use-chips="true"
            custom-class="generic-selector" />

          <LineSelector
            v-else-if="cform.name === 'campaign_id'"
            v-model="resources[cform.name]"
            :multiple="false"
            :use-chips="true"
            :generic-styling="false"
            :generic-multiselect="false"
            @change="(eventPayload) => onLineFilterChange(eventPayload, 'campaigns')"></LineSelector>

          <ScriptSelector
            v-else-if="cform.name === 'script_id'"
            v-model="resources[cform.name]"
            :communication="contact"
            class="w-100"></ScriptSelector>

          <CallDispositionSelector
            v-else-if="cform.name === 'call_disposition_ids'"
            v-model="resources[cform.name]"
            :multiple="true"
            :highlighted="isChanged('call_dispositions')"
            @change="{}"
            class="pb-3">
          </CallDispositionSelector>

          <ContactDispositionSelector
            v-else-if="cform.name === 'contact_disposition_ids'"
            v-model="resources[cform.name]"
            :generic-styling="false"
            :multiple="true"
            :use-chips="true"
            :outlined="true"
            :show-placeholder="false"
            custom-class="padded-container-1 generic-selector-1"
            @change="{}"
            class="pb-3">
          </ContactDispositionSelector>

          <VmDropSelector
            v-else-if="cform.name === 'setVmDropShortcuts'"
            v-model="resources[cform.name]"
            class="w-100"
            @change="{}">
          </VmDropSelector>

          <p v-else-if="cform.name === 'skip_outside_daytime_hours'">
            <q-toggle
              v-model="resources[cform.name]"
              :true-value="1"
              :false-value="0"
              size="md"
              val="md" />
            <!-- <b-form-checkbox
              v-model="resources[cform.name]"
              name="check-button"
              switch>
              Switch
            </b-form-checkbox> -->
          </p>

          <WarmupPeriodSelector
            v-else-if="cform.name === 'warmup_period_in_seconds'"
            v-model="resources[cform.name]" />

          <q-select
            v-else
            v-model="resources[cform.name]"
            :options="[]"
            class="generic-selector-2"
            outlined dense />

        </div>
      </div>
    </div>
  </div>
</template>

<script>

import { mapState, mapGetters, mapActions } from 'vuex'
import MetricSelector from 'components/generic-selectors/session-metric-selector'
import WarmupPeriodSelector from 'components/generic-selectors/warmup-period-selector'
import LineSelector from 'components/generic-selectors/line-selector'
import ScriptSelector from 'components/generic-selectors/script-selector'
import CallDispositionSelector from 'components/generic-selectors/call-disposition-selector'
import ContactDispositionSelector from 'components/generic-selectors/contact-disposition-selector'
import VmDropSelector from 'components/generic-selectors/vm-drop-selector'
import { METRIC_OPTIONS_3 } from 'src/constants/stats'
import { SESSION_SETTINGS_ALL_FORMS, DEFAULT_SETTING_VALUES } from 'src/constants/power-dialer/forms'
import { WARM_UP_PERIOD_LIST } from 'src/constants/power-dialer/power-dialer-list'
import { isEmpty } from 'lodash'

const stats = { METRIC_OPTIONS_3 }

export default {
  name: 'StartDialSessionsForm',
  props: {
    name: {
      type: String,
      default: ''
    }
  },
  components: {
    MetricSelector,
    WarmupPeriodSelector,
    LineSelector,
    ScriptSelector,
    ContactDispositionSelector,
    VmDropSelector,
    CallDispositionSelector
  },
  mounted () {
    // Temporary disabled
    if (isEmpty(this.sessionSettings)) {
      this.resources = this.defaultSettings || DEFAULT_SETTING_VALUES
    } else {
      this.resources = Object.assign({}, this.sessionSettings)
    }
  },
  computed: {
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
    resourceObj: {
      get () {
        return this.resources
      },
      set (obj) {
        let { resources } = this
        resources.name = null
        resources.campaign_id = null
        resources.skip_outside_daytime_hours = true
        resources.warmup_period_in_seconds = 0
        resources.script_id = null
        resources.metric_options = []
        resources.call_disposition_ids = []
        resources.contact_disposition_ids = []
        resources.is_company_scope = null
        return resources
      }
    },
    metricOptions () {
      if (stats) {
        return stats.METRIC_OPTIONS_3
      }
      return []
    },
    warmUpPeriods () {
      let values = []
      values = [WARM_UP_PERIOD_LIST]
      for (let i = 1; i <= 10; i++) {
        values.push(`${i * 5} seconds`)
      }
      return values
    },
    forms () {
      return SESSION_SETTINGS_ALL_FORMS
    },
    defaultValues () {
      return DEFAULT_SETTING_VALUES
    }
  },
  methods: {
    ...mapActions('powerDialer', [
      'setDefaultSettings',
      'getWarmupDurations'
    ]),
    onLineFilterChange (value, prop) {
      this.resources.campaign_id = value
      // this.filter[prop] = value
      // this.updateChannelChangedFilterFields({
      //   name: prop,
      //   value: value
      // })
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
    }
  },
  watch: {
    resources: {
      handler (val) {
        this.setDefaultSettings(val)
        if (val?.campaign_id?.toString().length > 0 && val?.warmup_period_in_seconds?.toString().length > 0) {
          this.$emit('valid-form', true)
        } else {
          this.$emit('invalid-form', true)
        }
      },
      deep: true
    },
    sessionSettings (val) {
      // console.log('val :>> ', isEmpty(val))
      if (isEmpty(val)) {
        // console.log('1001 :>> ', 1001)
        this.resources = this.defaultSettings || this.defaultValues
      } else {
        this.resources = this.sessionSettings
        // console.log('this.sessionSettings :>> ', this.sessionSettings)
      }
    }
  },
  data () {
    return {
      selectWidth: 0,
      resources: {
        call_disposition_ids: [],
        campaign_id: null,
        company_id: null,
        contact_disposition_ids: [],
        id: null,
        is_company_scope: null,
        metric_options: [],
        name: null,
        script_id: null,
        skip_outside_daytime_hours: 1,
        user_id: null,
        warmup_period_in_seconds: 0
      }
    }
  }
}
</script>
