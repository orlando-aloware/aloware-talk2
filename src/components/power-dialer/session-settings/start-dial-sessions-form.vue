<template>
  <div class="row">
    <div
      v-for="form in forms"
      :key="form.name"
      class="col-12 px-0">
      <label
        class="label mb-1 text-weight-bold text-subtitle1 pl-3 py-2">
        {{ form.label }}
      </label>
      <div
        class="row">
        <div
          v-for="cform in form.children"
          :key="cform.name"
          class="col-6 pl-3">
          <label
            class="label mb-1">
            {{ cform.label }}
            </label>

          <q-select
            v-if="cform.name === 'setSessionMetrics'"
            @popup-show="onShowMetricsMenu"
            outlined dense emit-value
            v-model="resources[cform.name]"
            :options="metricOptions"
            option-value="text"
            option-label="text"
            ref="setSessionMetrics"
            :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`">
            <template v-slot:selected>
              <template v-if="resources[cform.name]">
                {{ resources[cform.name] }}
              </template>
              <template v-else>
                Add Metrics
              </template>
            </template>
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                <q-item-section v-if="!scope.opt.disable" avatar></q-item-section>
                <q-item-section>
                  <q-item-label
                    v-if="scope.opt.disable"
                    class="text-subtitle2 font-weight-bold"
                    disabled label
                    v-html="scope.opt.text" />
                  <q-item-label
                    v-else
                    v-html="scope.opt.text" />
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <LineSelector
            v-else-if="cform.name === 'line'"
            v-model="resources[cform.name]"
            :multiple="false"
            :use-chips="true"
            :generic-styling="false"
            :generic-multiselect="false"
            @change="(eventPayload) => onFilterChange(eventPayload, 'campaigns')"></LineSelector>

          <ScriptSelector
            v-else-if="cform.name === 'phoneScript'"
            v-model="resources[cform.name]"
            :communication="true"
            class="w-100"></ScriptSelector>

          <CallDispositionSelector
            v-else-if="cform.name === 'setCallDispostionShortcuts'"
            v-model="resources[cform.name]"
            :multiple="false"
            :highlighted="isChanged('call_dispositions')"
            @change="{}"></CallDispositionSelector>

          <ContactDispositionSelector
            v-else-if="cform.name === 'setContactDispostionShortcuts'"
            v-model="resources[cform.name]"
            :generic-styling="false"
            :multiple="false"
            :use-chips="false"
            :outlined="true"
            :show-placeholder="false"
            custom-class="generic-selector"
            @change="{}">
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

          <q-select
            v-else-if="cform.name === 'warmupPeriod'"
            v-model="resources[cform.name]"
            @popup-show="onShowWarmUpMenu"
            ref="warmupPeriod"
            :options="warmUpPeriods"
            outlined dense
            class="generic-selector"
            :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"></q-select>

          <q-select
            v-else
            v-model="resources[cform.name]"
            :options="[]"
            class="generic-selector"
            outlined dense />

        </div>
      </div>
    </div>
  </div>
</template>

<script>

import { mapState } from 'vuex'
import LineSelector from 'components/generic-selectors/line-selector'
import ScriptSelector from 'components/generic-selectors/script-selector'
import CallDispositionSelector from 'components/generic-selectors/call-disposition-selector'
import ContactDispositionSelector from 'components/generic-selectors/contact-disposition-selector'
import VmDropSelector from 'components/generic-selectors/vm-drop-selector'
import { METRIC_OPTIONS_2 } from 'src/constants/stats'
import { SESSION_SETTINGS_ALL_FORMS } from 'src/constants/power-dialer/forms'
import { WARM_UP_PERIOD_LIST } from 'src/constants/power-dialer/power-dialer-list'

const stats = { METRIC_OPTIONS_2 }

export default {
  name: 'StartDialSessionsForm',
  props: {
    name: {
      type: String,
      default: ''
    }
  },
  components: {
    LineSelector,
    ScriptSelector,
    ContactDispositionSelector,
    VmDropSelector,
    CallDispositionSelector
  },
  computed: {
    ...mapState('inbox', [
      'channelChangedFilterFields'
    ]),
    metricOptions () {
      if (stats) {
        return stats.METRIC_OPTIONS_2
      }
      return []
    },
    warmUpPeriods () {
      let values = WARM_UP_PERIOD_LIST
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
    onFilterChange (value, prop) {
      console.log('value :>> ', value)
      console.log('prop :>> ', prop)
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
  data () {
    return {
      selectWidth: 0,
      resources: {
        line: [],
        skipOutsideDaytimeHours: '',
        warmupPeriod: '',
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
