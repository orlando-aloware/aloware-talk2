<template>
  <div>

    <contact-input-field
      v-model="attribute.value"
      :disabled="disabled"
      @updateField="(eventPayload) => $emit('updateField', eventPayload)"
    />

  </div>
</template>

<script>
import ContactInputField from 'components/contacts/contact-input-field'

export default {
  name: 'attribute-type-text',

  components: {
    ContactInputField
  },

  props: {
    attribute: {
      required: true,
      type: Object
    },
    disabled: {
      required: true,
      type: Boolean
    }
  }
}
</script>
