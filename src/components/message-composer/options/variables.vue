<template>
  <div>
    <vue-multiselect track-by="value"
                     label="label"
                     placeholder="Select a variable"
                     tagPosition="bottom"
                     ref="multiselect"
                     group-label="type"
                     group-values="variables"
                     v-model="variable"
                     data-testid="variables-multiselect"
                     :class="`custom-multi-select custom-multi-select-single ${alwaysOpenClass} options__no-border`"
                     :options="multiselectOptions"
                     :searchable="true"
                     :showNoResults="false"
                     :close-on-select="closeOnSelect"
                     :show-labels="false"
                     :maxHeight="220"
                     :group-select="false"
                     @select="onSelect"
                     @remove="onRemove"
                     @close="onClose">

      <template slot="caret">
        <i class="fa fa-search search-icon" data-testid="variables-search-icon"></i>
      </template>
      <!--      <template slot="singleLabel" slot-scope="{ option }">{{ option.label }}</template>-->
      <template v-slot:option="props">
        <div v-if=" props.option.hasOwnProperty('$groupLabel')" class="option__group_header">
          <span class="option__title">{{ props.option.$groupLabel }}</span>
        </div>
        <div v-else class="option__desc">
          <span class="option__title">{{ props.option.label }}</span>
          <br/>
          <p class="option__small mb-0">{{ props.option.description }}</p>
        </div>
      </template>
    </vue-multiselect>
  </div>
</template>
<script>

import { mapGetters } from 'vuex'
import VueMultiselect from 'vue-multiselect'
import * as Variables from 'src/constants/variables'

export default {
  name: 'variables',
  components: { VueMultiselect },
  props: {
    alwaysOpen: {
      type: Boolean,
      default: false
    },
    closeOnSelect: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters('contacts', ['messageComposer']),
    formattedOptions () {
      const contactVariables = [...this.Variables.CONTACT_VARIABLES]

      contactVariables.unshift({
        group: 'Contact Variables',
        disable: true
      })

      const variablesArray = { data: contactVariables }

      if (this.Variables.AGENT_VARIABLES && this.Variables.AGENT_VARIABLES.length > 0) {
        const agentVariables = [...this.Variables.AGENT_VARIABLES]
        agentVariables.unshift({
          group: 'Agent Variables',
          disable: true
        })
        variablesArray.data = [...contactVariables, ...agentVariables]
      }

      if (this.Variables.LINE_VARIABLES && this.Variables.LINE_VARIABLES.length > 0) {
        const lineVariables = [...this.Variables.LINE_VARIABLES]
        lineVariables.unshift({
          group: 'Line Variables',
          disable: true
        })
        variablesArray.data = [...contactVariables, ...lineVariables]
      }

      if (this.Variables.ACCOUNT_VARIABLES && this.Variables.ACCOUNT_VARIABLES.length > 0) {
        const accountVariables = [...this.Variables.ACCOUNT_VARIABLES]
        accountVariables.unshift({
          group: 'Account Variables',
          disable: true
        })
        variablesArray.data = [...contactVariables, ...accountVariables]
      }

      if (this.Variables.CSF_VARIABLES && this.Variables.CSF_VARIABLES.length > 0) {
        const csfVariables = [...this.Variables.CSF_VARIABLES]
        csfVariables.unshift({
          group: 'CSF Variables',
          disable: true
        })
        variablesArray.data = [...contactVariables, ...csfVariables]
      }

      return variablesArray.data
    },
    multiselectOptions () {
      const groups = [
        {
          type: 'Contact Variables',
          variables: this.Variables.CONTACT_VARIABLES
        }
      ]

      if (this.Variables.AGENT_VARIABLES && this.Variables.AGENT_VARIABLES.length > 0) {
        groups.push(
          {
            type: 'Agent Variables',
            variables: this.Variables.AGENT_VARIABLES
          }
        )
      }

      if (this.Variables.LINE_VARIABLES && this.Variables.LINE_VARIABLES.length > 0) {
        groups.push(
          {
            type: 'Line Variables',
            variables: this.Variables.LINE_VARIABLES
          }
        )
      }
      if (this.Variables.ACCOUNT_VARIABLES && this.Variables.ACCOUNT_VARIABLES.length > 0) {
        groups.push(
          {
            type: 'Account Variables',
            variables: this.Variables.ACCOUNT_VARIABLES
          }
        )
      }
      if (this.Variables.CSF_VARIABLES && this.Variables.CSF_VARIABLES.length > 0) {
        groups.push(
          {
            type: 'CSF Variables',
            variables: this.Variables.CSF_VARIABLES
          }
        )
      }

      return groups
    },
    alwaysOpenClass () {
      return this.alwaysOpen ? 'always-open' : ''
    }
  },
  data () {
    return {
      is_busy: false,
      variable: null,
      options: this.formattedOptions,
      Variables
    }
  },
  methods: {
    filterFn (val, update) {
      if (val === '') {
        update(() => {
          this.options = this.formattedOptions
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.options = this.formattedOptions.filter(v => v.label && v.label.toLowerCase().indexOf(needle) > -1)
      })
    },
    onSelect (selectedOption, id) {
      this.$el.querySelector('.custom-multi-select-single input.multiselect__input').placeholder = selectedOption ? selectedOption.label : this.placeholder
    },
    onRemove () {
      this.$el.querySelector('.custom-multi-select-single input.multiselect__input').placeholder = this.placeholder
    },
    onClose () {
      this.$emit('close')
    }
  },
  watch: {
    'variable': function (value) {
      if (value) {
        this.$emit('variableSelected', value.value)
      }
      this.variable = null
    }
  },
  mounted () {
    this.options = this.formattedOptions
  }
}
</script>

<style src="../../../../node_modules/vue-multiselect/dist/vue-multiselect.min.css"></style>
