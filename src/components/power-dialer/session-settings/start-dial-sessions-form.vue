<template>
  <q-card class="row"
          v-if="resources">
    <div class="col-12 px-0"
         :key="form.name"
         v-for="form in forms">
      <label class="label mb-1 text-weight-bold text-subtitle1 pl-3 py-2">
        {{ form.label }}
      </label>
      <div class="row pb-4 dial-sessions__form">
        <div class="col-6 pl-3"
             :key="cform.name"
             v-for="cform in form.children">
          <label class="label mb-1">
            {{ cform.label }}
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
                    :placeholder="resources[cform.name]?.length > 0 ? '' : 'Select session metrics'"
                    v-if="cform.name === 'metric_options'"
                    v-model="resources[cform.name]">
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

          <line-selector :multiple="false"
                         :use-chips="true"
                         :disable="disabled"
                         :generic-styling="false"
                         :generic-multiselect="false"
                         :force-remove-missing-values="true"
                         v-else-if="cform.name === 'campaign_id'"
                         v-model="resources[cform.name]"
                         @change="(eventPayload) => onSettingsChange(eventPayload, cform.name)"/>

          <script-selector class="w-100 dial-sessions__form__script-selector"
                           :class="[resources[cform.name] ? 'populated': '']"
                           :disable="disabled"
                           :clearable="true"
                           v-else-if="cform.name === 'script_id'"
                           v-model="resources[cform.name]"
                           @change="(eventPayload) => onSettingsChange(eventPayload, cform.name)"/>

          <session-order-selector class="generic-selector-2 dial-sessions__form__order-selector"
                                  v-else-if="cform.name === 'order'"
                                  v-model="resources[cform.name]"
                                  @change="(eventPayload) => onSettingsChange(eventPayload, cform.name)"/>

          <call-disposition-selector class="pb-3 dial-sessions__form__call-disposition-selector"
                                     :multiple="true"
                                     :highlighted="isChanged('call_dispositions')"
                                     :disable="disabled"
                                     v-else-if="cform.name === 'call_disposition_ids'"
                                     v-model="resources[cform.name]"
                                     @change="(eventPayload) => onSettingsChange(eventPayload, cform.name)"/>

          <contact-disposition-selector class="pb-3 dial-sessions__form__contact-disposition-selector"
                                        custom-class="padded-container-1 generic-selector-1"
                                        :generic-styling="false"
                                        :multiple="true"
                                        :use-chips="true"
                                        :outlined="true"
                                        :disable="disabled"
                                        :show-placeholder="true"
                                        v-else-if="cform.name === 'contact_disposition_ids'"
                                        v-model="resources[cform.name]"
                                        @change="(eventPayload) => onSettingsChange(eventPayload, cform.name)"/>

          <vm-drop-selector class="w-100 dial-sessions__form__vm-drop-selector"
                            :use-chips="true"
                            :multiple="true"
                            :show-placeholder="true"
                            :disable="disabled"
                            v-model="resources[cform.name]"
                            v-else-if="cform.name === 'vm_drop_ids'"
                            @change="(eventPayload) => onSettingsChange(eventPayload, cform.name)"/>

          <p v-else-if="cform.name === 'skip_outside_daytime_hours'">
            <q-toggle size="md"
                      val="md"
                      :true-value="1"
                      :false-value="0"
                      :disable="disabled"
                      v-model="resources[cform.name]" />
          </p>

          <warmup-period-selector class="dial-sessions__form__warmup-period-selector"
                                  :disable="disabled"
                                  v-else-if="cform.name === 'warmup_period_in_seconds'"
                                  v-model="resources[cform.name]"
                                  @change="(eventPayload) => onSettingsChange(eventPayload, cform.name)"/>
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
import { SESSION_SETTINGS_ALL_FORMS, DEFAULT_SETTING_VALUES } from 'src/constants/power-dialer/forms'
import { WARM_UP_PERIOD_LIST } from 'src/constants/power-dialer/power-dialer-list'

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
    SessionOrderSelector
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
