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
               @input="onOptionSelected(option)">
        <label :class="['broadcast-add__contacts__options__option', { 'broadcast-add__contacts__options__option--active': optionSelected === option.value }]"
               :for="`contacts-option-${option.value}`">
          {{ option.text }}
          <span class="broadcast-add__contacts__options__option__icon"
                v-if="optionSelected === option.value">
            <check-o-icon color="#fff"/>
          </span>
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
        <div v-if="integrationsEnabled.length > 1">
          <q-select style="word-break: break-all;"
                    color="primary"
                    use-input
                    emit-value
                    map-options
                    dense
                    outlined
                    hide-bottom-space
                    :placeholder="!source.integration.name ? 'Select a integration' : ''"
                    :options="integrationsEnabled"
                    v-model="source.integration.name">
          </q-select>
        </div>

        <integration-list-selector ref="integrationListSelector"
                                   :use-chips="false"
                                   :multiple="false"
                                   :clearable="true"
                                   :generic-styling="false"
                                   :integration="source.integration.name"
                                   v-if="source.integration.name"
                                   @change="onIntegrationListChanged"/>
      </template>

      <!-- Filters option -->
      <transition name="slide-left">
        <contacts-filters class="broadcast-add__contacts__filters"
                          no-close-button
                          v-if="optionSelected === 'filter'"
                          @filtersUpdated="onFiltersUpdated"/>
      </transition>
    </div>
  </div>
</template>

<script>
import CheckOIcon from 'src/components/icons/check-o-icon.vue'
import ContactsFilters from 'src/components/contacts/contacts-filters.vue'
import ContactsListSelector from 'src/components/generic-selectors/contacts-list-selector.vue'
import IntegrationListSelector from 'components/generic-selectors/integration-list-selector'
import { integrationMixin } from 'src/plugins/mixins'
import { mapActions, mapGetters } from 'vuex'
import { isEmpty } from 'lodash'

export default {
  name: 'broadcast-add-view-contacts',

  mixins: [
    integrationMixin
  ],

  components: {
    CheckOIcon,
    ContactsFilters,
    ContactsListSelector,
    IntegrationListSelector
  },

  props: {
    defaultSource: {
      type: Object,
      required: false,
      default: () => ({})
    }
  },

  computed: {
    ...mapGetters('contacts', [
      'currentListFilters'
    ]),

    isValid () {
      switch (this.optionSelected) {
        case 'list':
          return !!this.source.list.id
        case 'filter':
          return !isEmpty(this.source.filters)
        case 'integration':
          return false // FIXME
        default:
          return false
      }
    },

    integrationText () {
      return this.integrationsEnabled.length > 1
        ? 'Integration'
        : this.integrationsEnabled[0]
    }
  },

  data: () => ({
    optionSelected: null,
    options: [
      {
        value: 'list',
        text: 'By List'
      },
      {
        value: 'filter',
        text: 'By Filter'
      },
      {
        value: 'integration',
        text: 'Integrations'
      }
    ],
    source: {
      list: {},
      filters: {},
      integration: {}
    }
  }),

  mounted () {
    if (!isEmpty(this.defaultSource.list)) {
      this.optionSelected = 'list'
    }

    if (!isEmpty(this.defaultSource.filters)) {
      this.optionSelected = 'filter'
      this.openFilters()
    }

    if (!isEmpty(this.defaultSource.integration)) {
      this.optionSelected = 'integration'
    }

    this.source = this.defaultSource
  },

  methods: {
    ...mapActions('contacts', [
      'closeFilters',
      'openFilters',
      'setCurrentListFilters'
    ]),

    onOptionSelected (option) {
      this.optionSelected = option.value

      // reset to default values when option changes
      this.reset()

      // force integration value when there is only one enabled integration
      if (option.value === 'integration' && this.integrationsEnabled.length === 1) {
        this.source.integration.name = this.integrationsEnabled[0]

        // use next tick to make sure ref is loaded
        this.$nextTick()
          .then(() => {
            this.$refs.integrationListSelector.getListsOfEnabledIntegration()
          })
      }
    },

    onContactListSelected (list) {
      this.source.list = {
        id: list.id,
        name: list.name
      }
    },

    onFiltersUpdated () {
      this.source.filters = this.currentListFilters
    },

    onIntegrationListChanged (integration) {
      this.$set(this.source.integration, 'list', integration.list)
    },

    reset () {
      this.source = {
        list: {},
        filters: {},
        integration: {}
      }

      if (this.optionSelected === 'filter') {
        this.openFilters()
      } else {
        this.closeFilters()
        this.setCurrentListFilters({})
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
        this.$emit('source-updated', value)
      }
    }
  }
}
</script>
