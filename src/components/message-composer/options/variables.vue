<template>
  <div>
    <vue-multiselect
                 v-model="variable"
                 track-by="value"
                 label="label"
                 :class="`custom-multi-select custom-multi-select-single ${alwaysOpenClass} options__no-border`"
                 placeholder="Select a variable"
                 :options="multiselectOptions"
                 :searchable="true"
                 :showNoResults="false"
                 :close-on-select="false"
                 :show-labels="false"
                 tagPosition="bottom"
                 ref="multiselect"
                 :maxHeight="220"
                 group-label="type"
                 group-values="variables"
                 :group-select="false"
                 @select="onSelect"
                 @remove="onRemove">
      <template slot="caret">
        <i class="fa fa-search search-icon"></i>
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

export default {
  name: 'variables',
  components: { VueMultiselect },
  props: {
    alwaysOpen: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  computed: {
    ...mapGetters('contacts', ['messageComposer']),
    formattedOptions () {
      let contactVariables = [...this.contactVariables]

      contactVariables.unshift({
        group: 'Contact Variables',
        disable: true
      })

      let variablesArray = contactVariables

      if (this.agentVariables && this.agentVariables.length > 0) {
        let agentVariables = [...this.agentVariables]
        agentVariables.unshift({
          group: 'Agent Variables',
          disable: true
        })
        variablesArray = [...contactVariables, ...agentVariables]
      }

      if (this.lineVariables && this.lineVariables.length > 0) {
        let lineVariables = [...this.lineVariables]
        lineVariables.unshift({
          group: 'Line Variables',
          disable: true
        })
        variablesArray = [...contactVariables, ...lineVariables]
      }

      if (this.accountVariables && this.accountVariables.length > 0) {
        let accountVariables = [...this.accountVariables]
        accountVariables.unshift({
          group: 'Account Variables',
          disable: true
        })
        variablesArray = [...contactVariables, ...accountVariables]
      }

      if (this.csfVariables && this.csfVariables.length > 0) {
        let csfVariables = [...this.csfVariables]
        csfVariables.unshift({
          group: 'CSF Variables',
          disable: true
        })
        variablesArray = [...contactVariables, ...csfVariables]
      }

      return variablesArray
    },
    multiselectOptions () {
      let groups = [
        {
          type: 'Contact Variables',
          variables: this.contactVariables
        }
      ]

      if (this.agentVariables && this.agentVariables.length > 0) {
        groups.push(
          {
            type: 'Agent Variables',
            variables: this.agentVariables
          }
        )
      }

      if (this.lineVariables && this.lineVariables.length > 0) {
        groups.push(
          {
            type: 'Line Variables',
            variables: this.lineVariables
          }
        )
      }
      if (this.accountVariables && this.accountVariables.length > 0) {
        groups.push(
          {
            type: 'Account Variables',
            variables: this.accountVariables
          }
        )
      }
      if (this.csfVariables && this.csfVariables.length > 0) {
        groups.push(
          {
            type: 'CSF Variables',
            variables: this.csfVariables
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
      contactVariables: [
        {
          label: '[FirstName]',
          value: '[FirstName]',
          description: 'to include contact’s first name'
        },
        {
          label: '[LastName]',
          value: '[LastName]',
          description: 'to include contact’s last name'
        },
        {
          label: '[FullName]',
          value: '[FullName]',
          description: 'to include contact’s full name'
        },
        {
          label: '[Email]',
          value: '[Email]',
          description: 'to include contact’s email address'
        },
        {
          label: '[Website]',
          value: '[Website]',
          description: 'to include contact’s website'
        },
        {
          label: '[Address]',
          value: '[Address]',
          description: 'to include contact’s address'
        },
        {
          label: '[CompanyName]',
          value: '[CompanyName]',
          description: 'to include contact’s company name'
        },
        {
          label: '[ContactNotes]',
          value: '[ContactNotes]',
          description: 'to include contact’s notes'
        },
        {
          label: '[OwnerName]',
          value: '[OwnerName]',
          description: 'to include lead owner’s full name'
        },
        {
          label: '[OwnerFirstName]',
          value: '[OwnerFirstName]',
          description: 'to include contact owner’s first name'
        },
        {
          label: '[OwnerLastName]',
          value: '[OwnerLastName]',
          description: 'to include contact owner’s last name'
        },
        {
          label: '[LeadNumber]',
          value: '[LeadNumber]',
          description: 'to include contact’s phone number'
        },
        {
          label: '[City]',
          value: '[City]',
          description: 'to include contact’s city'
        },
        {
          label: '[State]',
          value: '[State]',
          description: 'to include contact’s state (abbr)'
        },
        {
          label: '[FullState]',
          value: '[FullState]',
          description: 'to include contact’s state full name'
        },
        {
          label: '[ZipCode]',
          value: '[ZipCode]',
          description: 'to include contact’s zip code'
        },
        {
          label: '[Country]',
          value: '[Country]',
          description: 'to include contact’s country'
        },
        {
          label: '[DateOfBirth]',
          value: '[DateOfBirth]',
          description: 'to include contact’s date of birth'
        },
        {
          label: '[ContactId]',
          value: '[ContactId]',
          description: 'to include the id of the contact (this is mostly used in tracking individual contacts through links)'
        }
      ],
      agentVariables: [
        {
          label: '[AgentName]',
          value: '[AgentName]',
          description: 'to include agent’s full name'
        },
        {
          label: '[AgentFirstName]',
          value: '[AgentFirstName]',
          description: 'to include agent’s first name'
        },
        {
          label: '[AgentLastName]',
          value: '[AgentLastName]',
          description: 'to include agent’s last name'
        }
      ],
      lineVariables: [
        {
          label: '[LineName]',
          value: '[LineName]',
          description: 'to include name of this line'
        },
        {
          label: '[TrackingNumber]',
          value: '[TrackingNumber]',
          description: 'to include tracking number of this line'
        }
      ],
      accountVariables: [
        {
          label: '[AccountName]',
          value: '[AccountName]',
          description: 'to include the name of your account'
        }
      ],
      csfVariables: [
        {
          label: '[CSF1]',
          value: '[CSF1]',
          description: 'to include contact’s custom field 1'
        },
        {
          label: '[CSF2]',
          value: '[CSF2]',
          description: 'to include contact’s custom field 2'
        }
      ]
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
      this.$el.querySelector('.custom-multi-select-single input.multiselect__input').placeholder = (selectedOption) || this.placeholder
    },
    onRemove () {
      this.$el.querySelector('.custom-multi-select-single input.multiselect__input').placeholder = this.placeholder
    }
  },
  watch: {
    'variable': function (value) {
      if (value) {
        this.$emit('variableSelected', value.value)
      }
    }
  },
  mounted () {
    this.options = this.formattedOptions
  }
}
</script>

<style src="../../../../node_modules/vue-multiselect/dist/vue-multiselect.min.css"></style>
<style lang="scss" scoped>
@import '../../../css/mixins';
@import '../../../css/variables';
@import '../../../css/breakpoints';
  .group-label {
    font-size: 90%;
  }

  .custom-multi-select {
    .multiselect__content-wrapper {
      overflow: hidden;
    }

    .multiselect__option {
      padding: 5px !important;
    }

    i.search-icon {
      right: 14px;
      position: absolute;
      top: 12px;
    }
  }

  .option__desc {
    padding-left: 20px;

    .option__title {
      font-size: 13px;
      font-weight: 500;
      line-height: 16.94px;
    }

    .option__small {
      font-size: 11px;
      font-weight: 400;
      color: $grey-90;
      max-width: 240px;
      white-space: normal;
    }
  }

  .option__group_header {
    font-size: 13px;
    font-weight: 500;
    color: $grey-100;
    padding-top: 0;
    margin-left: 5px;
  }
</style>
