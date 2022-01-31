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
            v-if="cform.name === 'setSessionMetrics'"
            v-model="resources[cform.name]"
            :options="metricOptions"
            custom-class="generic-selector" />

          <LineSelector
            v-else-if="cform.name === 'line'"
            v-model="resources[cform.name]"
            :multiple="false"
            :use-chips="true"
            :generic-styling="false"
            :generic-multiselect="false"
            @change="(eventPayload) => onLineFilterChange(eventPayload, 'campaigns')"></LineSelector>

          <ScriptSelector
            v-else-if="cform.name === 'phoneScript'"
            v-model="resources[cform.name]"
            :communication="contact"
            class="w-100"></ScriptSelector>

          <CallDispositionSelector
            v-else-if="cform.name === 'setCallDispostionShortcuts'"
            v-model="resources[cform.name]"
            :multiple="false"
            :highlighted="isChanged('call_dispositions')"
            @change="{}"
            class="pb-3">
          </CallDispositionSelector>

          <ContactDispositionSelector
            v-else-if="cform.name === 'setContactDispostionShortcuts'"
            v-model="resources[cform.name]"
            :generic-styling="false"
            :multiple="false"
            :use-chips="false"
            :outlined="true"
            :show-placeholder="false"
            custom-class="padded-container generic-selector"
            @change="{}"
            class="pb-3">
          </ContactDispositionSelector>

          <VmDropSelector
            v-else-if="cform.name === 'setVmDropShortcuts'"
            v-model="resources[cform.name]"
            class="w-100"
            @change="{}">
          </VmDropSelector>

          <p v-else-if="cform.name === 'skipOutsideDaytimeHours'">
            <q-toggle
              v-model="resources[cform.name]"
              size="md"
              val="md" />
          </p>

          <WarmupPeriodSelector
            v-else-if="cform.name === 'warmupPeriod'"
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
import { SESSION_SETTINGS_ALL_FORMS } from 'src/constants/power-dialer/forms'
import { WARM_UP_PERIOD_LIST } from 'src/constants/power-dialer/power-dialer-list'
// import { isEmpty } from 'lodash'

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
    // this.resourceObj = this.sessionSettings
  },
  computed: {
    ...mapState('inbox', [
      'channelChangedFilterFields'
    ]),
    ...mapGetters('contacts', [
      'contact'
    ]),
    ...mapGetters('powerDialer', [
      'sessionSettings'
    ]),
    resourceObj: {
      get () {
        return this.resources
      },
      set (obj) {
        let { resources } = this
        resources.line = ''
        resources.skipOutsideDaytimeHours = obj.skip_outside_daytime_hours === 1
        resources.warmupPeriod = obj.warmup_period_in_seconds || 0
        resources.phoneScript = obj.script_id || ''
        resources.setSessionMetrics = ''
        resources.setCallDispostionShortcuts = obj.call_disposition_ids || []
        resources.setContactDispostionShortcuts = obj.contact_disposition_ids || []
        resources.setVmDropShortcuts = ''
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
    }
  },
  methods: {
    ...mapActions('powerDialer', [
      'getWarmupDurations'
    ]),
    onLineFilterChange (value, prop) {
      this.resources.line = value
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
      this.selectWidth = this.$refs.setSessionMetrics[0].$el.offsetWidth
    },
    onShowWarmUpMenu () {
      this.selectWidth = this.$refs.warmupPeriod[0].$el.offsetWidth
    }
  },
  watch: {
    resources: {
      handler (val) {
        if (val?.line?.toString().length > 0 && val?.warmupPeriod?.toString().length > 0) {
          this.$emit('valid-form', true)
        } else {
          this.$emit('invalid-form', true)
        }
      },
      deep: true
    }
  },
  data () {
    return {
      selectWidth: 0,
      resources: {
        line: '',
        skipOutsideDaytimeHours: true,
        warmupPeriod: 0,
        phoneScript: '',
        setSessionMetrics: '',
        setCallDispostionShortcuts: [],
        setContactDispostionShortcuts: '',
        setVmDropShortcuts: ''
      }
    }
  }
}
</script>
