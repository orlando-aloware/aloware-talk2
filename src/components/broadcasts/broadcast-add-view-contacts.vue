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
        <contacts-list-selector :value="list.id"
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

export default {
  name: 'broadcast-add-view-contacts',

  components: {
    CheckOIcon,
    ContactsListSelector
  },

  computed: {
    isValid () {
      return !!this.optionSelected
      // [x] option is selected
      // [ ] if is list, list must have contacts
      // [ ] if is filter, there must be contacts under the filter
      // [ ] no validation for integration for now
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
    list: {}
  }),

  methods: {
    onOptionSelected (option) {
      this.optionSelected = option.value
    },

    onContactListSelected (list) {
      this.list = {
        type: 'contacts-list',
        id: list.id
      }
    }
  },

  watch: {
    isValid (state) {
      this.$emit('input', state)
    },

    list (value) {
      this.$emit('list-updated', value)
    }
  }
}
</script>
