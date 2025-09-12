<template>
  <div class="broadcast-add broadcast-add__contacts">
    <p>Select a group of contacts</p>
    <div class="broadcast-add__contacts__options">
      <div class="flex-grow-1"
           :key="option.id"
           :tabindex="option.id"
           v-for="option in options">
        <input type="radio"
               class="d-none"
               name="broadcast-add-view-contacts-option"
               :id="`contacts-option-${option.value}`"
               :value="option.value"
               :disabled="!option.enabled"
               @input="onOptionSelected(option)">
        <label :class="getOptionClasses(option)"
               :for="`contacts-option-${option.value}`">
          {{ option.text }}
          <span class="broadcast-add__contacts__options__option__icon"
                v-if="optionSelected === option.value">
            <check-o-icon color="#fff"/>
          </span>
          <q-tooltip v-if="!option.enabled">
            {{ option.disabledTooltip }}
          </q-tooltip>
        </label>
      </div>
    </div>

    <div class="broadcast-add__contacts__selection">
      <!-- List option -->
      <template v-if="optionSelected === 'list'">
        <p>Select a contact list</p>
        <contacts-list-selector :value="source.list.id"
                                @select="onContactListSelected"/>
      </template>

      <!-- Integration option -->
      <template v-else-if="optionSelected === 'integration'">
        <p>Select a {{ integrationText }} list</p>
        <!-- shows the selector based on which integration is enabled  -->
        <div v-if="filteredEnabledIntegrations.length > 1">
          <q-select style="word-break: break-all;"
                    color="primary"
                    use-input
                    emit-value
                    map-options
                    dense
                    outlined
                    hide-bottom-space
                    :placeholder="!source.integration.name ? 'Select an integration' : ''"
                    :options="filteredEnabledIntegrations"
                    :value="source.integration?.name"
                    @input="onIntegrationNameInput">
          </q-select>
        </div>

        <integration-list-selector ref="integrationListSelector"
                                   :use-chips="false"
                                   :multiple="false"
                                   :clearable="true"
                                   :generic-styling="false"
                                   :integration="source.integration.name"
                                   v-if="source.integration.name && !isHighLevelSelected"
                                   @change="onIntegrationListChanged"/>

        <div v-if="isHighLevelSelected" class="highlevel-criteria-section">
          <highlevel-search-criteria-form
            class="mt-3"
            v-model="highlevelSearchCriteria"
            :available-fields="highlevelAvailableFields"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import CheckOIcon from 'src/components/icons/check-o-icon.vue'
import ContactsListSelector from 'src/components/generic-selectors/contacts-list-selector.vue'
import IntegrationListSelector from 'components/generic-selectors/integration-list-selector'
import HighlevelSearchCriteriaForm from 'src/components/integrations/highlevel-search-criteria-form.vue'
import * as ContactListTypes from 'src/constants/contacts-list-types'
import { integrationMixin } from 'src/plugins/mixins'
import { isEmpty } from 'lodash'
import talk2Api from 'src/plugins/api/api'
import {
  HUBSPOT_INTEGRATION,
  PIPEDRIVE_INTEGRATION,
  SALESFORCE_INTEGRATION,
  ZOHO_INTEGRATION,
  HIGHLEVEL_INTEGRATION
} from 'src/constants/integrations'

export default {
  name: 'broadcast-add-view-contacts',

  mixins: [
    integrationMixin
  ],

  components: {
    CheckOIcon,
    ContactsListSelector,
    IntegrationListSelector,
    HighlevelSearchCriteriaForm
  },

  props: {
    defaultSource: {
      type: Object,
      required: false,
      default: () => ({})
    }
  },

  computed: {
    isValid () {
      switch (this.optionSelected) {
        case 'list':
          return !!this.source.list.id || !isEmpty(this.source.filters)
        case 'integration':
          // HighLevel uses search criteria instead of a predefined list
          if (this.isHighLevelSelected) {
            return !isEmpty(this.highlevelSearchCriteria?.filters)
          }
          return !isEmpty(this.source.integration?.list)
        default:
          return false
      }
    },

    options () {
      return [
        {
          value: 'list',
          text: 'By List',
          enabled: true
        },
        {
          value: 'integration',
          text: 'Integrations',
          enabled: this.filteredEnabledIntegrations.length > 0,
          disabledTooltip: 'You don\'t have any integration enabled'
        }
      ]
    },

    integrationText () {
      return this.filteredEnabledIntegrations.length > 1
        ? 'Integration'
        : this.filteredEnabledIntegrations[0]
    },

    filteredEnabledIntegrations () {
      // show only ready for broadcast integrations
      // @see src/components/broadcasts/broadcast-add-view.vue
      return this.integrationsEnabled.filter(integration => [
        HUBSPOT_INTEGRATION, SALESFORCE_INTEGRATION, ZOHO_INTEGRATION, PIPEDRIVE_INTEGRATION, HIGHLEVEL_INTEGRATION
      ].includes(integration.toLowerCase()))
    },

    isHighLevelSelected () {
      return this.source.integration?.name?.toLowerCase() === HIGHLEVEL_INTEGRATION
    }
  },

  data: () => ({
    optionSelected: null,
    source: {
      list: {},
      integration: {}
    },
    highlevelSearchCriteria: {},
    highlevelAvailableFields: []
  }),

  mounted () {
    if (!isEmpty(this.defaultSource.list)) {
      this.optionSelected = 'list'
    }

    if (!isEmpty(this.defaultSource.integration)) {
      this.optionSelected = 'integration'
    }

    this.source = { ...this.source, ...this.defaultSource }
  },

  methods: {
    getOptionClasses (option) {
      return [
        'broadcast-add__contacts__options__option',
        { 'broadcast-add__contacts__options__option--active': this.optionSelected === option.value },
        { 'broadcast-add__contacts__options__option--disabled': !option.enabled }
      ]
    },

    onOptionSelected (option) {
      this.optionSelected = option.value

      // reset to default values when option changes
      this.reset()

      // force integration value when there is only one enabled integration
      if (option.value === 'integration' && this.filteredEnabledIntegrations.length === 1) {
        this.source.integration.name = this.filteredEnabledIntegrations[0]

        // use next tick to make sure ref is loaded
        this.$nextTick()
          .then(() => {
            if (this.isHighLevelSelected) {
              this.loadHighLevelFields()
            } else {
              this.$refs.integrationListSelector.getListsOfEnabledIntegration()
            }
          })
      }
    },

    onContactListSelected (list) {
      // reset list object
      this.reset()

      this.source.list = {
        id: list.id,
        name: list.name
      }

      switch (list.type) {
        // for static lists, just add the list ID in the params
        case ContactListTypes.STATIC:
        case ContactListTypes.DYNAMIC_REMOTE_LIST:
          this.source.list.type = 'static'
          break

        // for dynamic lists, destructure the filters
        case ContactListTypes.DYNAMIC:
          let filters = list.filters

          if (typeof list.filters === 'object') {
            // clear non-numeric keys
            const keys = Object.keys(list.filters).filter(key => !isNaN(+key))
            // use key's value but respecting keys order
            filters = keys.map(key => list.filters[key])
          }

          this.source.list.type = 'dynamic'
          this.source.list.filters = filters

          break
      }
    },

    onIntegrationListChanged (integration) {
      this.$set(this.source.integration, 'list', integration.list)
    },

    reset () {
      this.source = {
        list: {},
        integration: {}
      }
      this.highlevelSearchCriteria = {}
    },

    loadHighLevelFields () {
      talk2Api.V2.integrations.highlevel.getSearchOptions()
        .then(response => {
          this.highlevelAvailableFields = response.data || []
        })
        .catch(error => {
          console.error('Failed to load HighLevel fields:', error)
          this.highlevelAvailableFields = []
        })
    },

    onIntegrationNameInput (value) {
      this.$set(this.source.integration, 'name', value)

      // Load HighLevel fields if HighLevel is selected
      if (value.toLowerCase() === HIGHLEVEL_INTEGRATION) {
        this.loadHighLevelFields()
      }
    }
  },

  watch: {
    isValid (state) {
      this.$emit('input', state)
    },

    source: {
      deep: true,
      handler (value) {
        // Add HighLevel data to the source object
        if (this.isHighLevelSelected) {
          value.integration.highlevelSearchCriteria = this.highlevelSearchCriteria
        }

        // Only emit if we have meaningful data
        if (this.source.integration?.name || this.source.list?.id || this.source.list?.filters) {
          this.$emit('source-updated', value)
        }
      }
    },

    highlevelSearchCriteria: {
      deep: true,
      handler (newValue) {
        // Update source.integration when search criteria changes
        if (this.isHighLevelSelected) {
          this.$set(this.source.integration, 'highlevelSearchCriteria', newValue)
        }
      }
    }
  }
}
</script>
