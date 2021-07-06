<template>
  <div>
    <q-select clearable
              dense
              outlined
              use-input
              map-options
              emit-value
              option-value="value"
              option-label="label"
              ref="variableSelector"
              v-model="variable"
              :loading="is_busy"
              :options="options"
              @filter="filterFn">
      <template v-slot:option="scope">
        <q-item v-if="!scope.opt.group"
                v-bind="scope.itemProps"
                v-on="scope.itemEvents"
        >
          <q-item-section>
            <q-item-label v-html="scope.opt.label" ></q-item-label>
            <q-item-label caption>{{ scope.opt.description }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="scope.opt.group"
                v-bind="scope.itemProps"
                v-on="scope.itemEvents"
        >
          <q-item-label header class="group-label">{{ scope.opt.group }}</q-item-label>
        </q-item>
      </template>
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey p-2">
            No results
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  name: 'variables',
  computed: {
    ...mapGetters('contacts', ['message_composer']),
    formattedOptions () {
      let contactVariables = [...this.contact_variables]

      contactVariables.unshift({
        group: 'Contact Variables',
        disable: true
      })

      let variablesArray = contactVariables

      if (this.agent_variables && this.agent_variables.length > 0) {
        let agentVariables = [...this.agent_variables]
        agentVariables.unshift({
          group: 'Agent Variables',
          disable: true
        })
        variablesArray = [...contactVariables, ...agentVariables]
      }

      if (this.line_variables && this.line_variables.length > 0) {
        let lineVariables = [...this.line_variables]
        lineVariables.unshift({
          group: 'Line Variables',
          disable: true
        })
        variablesArray = [...contactVariables, ...lineVariables]
      }

      if (this.account_variables && this.account_variables.length > 0) {
        let accountVariables = [...this.account_variables]
        accountVariables.unshift({
          group: 'Account Variables',
          disable: true
        })
        variablesArray = [...contactVariables, ...accountVariables]
      }

      if (this.csf_variables && this.csf_variables.length > 0) {
        let csfVariables = [...this.csf_variables]
        csfVariables.unshift({
          group: 'CSF Variables',
          disable: true
        })
        variablesArray = [...contactVariables, ...csfVariables]
      }

      return variablesArray
    }
  },
  data () {
    return {
      is_busy: false,
      variable: null,
      options: this.formattedOptions,
      contact_variables: [
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
      agent_variables: [
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
      line_variables: [
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
      account_variables: [
        {
          label: '[AccountName]',
          value: '[AccountName]',
          description: 'to include the name of your account'
        }
      ],
      csf_variables: [
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
    }
  },
  watch: {
    'variable': function (value) {
      if (value) {
        this.$emit('variableSelected', value)
      }
    }
  },
  mounted () {
    this.options = this.formattedOptions
    this.$nextTick(function () {
      this.$refs.variableSelector.focus()
    })
  }
}
</script>

<style scoped>
  .group-label {
    font-size: 90%;
  }
</style>
