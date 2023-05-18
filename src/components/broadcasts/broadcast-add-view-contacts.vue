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
        <p>Select a contact list</p>
        <!-- shows the selector based on which integration is enabled  -->
      </template>
    </div>
  </div>
</template>

<script>
import CheckOIcon from 'src/components/icons/check-o-icon.vue'
import ContactsListSelector from 'src/components/generic-selectors/contacts-list-selector.vue'
import { isEmpty } from 'lodash'

export default {
  name: 'broadcast-add-view-contacts',

  components: {
    CheckOIcon,
    ContactsListSelector
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
        case 'integration':
          return !!this.source.list.id
        case 'filter':
          return true // FIXME: change this condition
        default:
          return false
      }
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

    this.source = this.defaultSource
  },

  methods: {
    onOptionSelected (option) {
      this.optionSelected = option.value

      // reset to default values when option changes
      this.reset()
    },

    onContactListSelected (list) {
      this.source.list = {
        type: 'contacts-list',
        id: list.id
      }
    },

    reset () {
      this.source = {
        list: {},
        filters: {},
        integration: {}
      }
    }
  },

  watch: {
    isValid (state) {
      this.$emit('input', state)
    },

    source (value) {
      this.$emit('source-updated', value)
    }
  }
}
</script>
