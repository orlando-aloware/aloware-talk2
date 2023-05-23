<template>
  <div class="broadcast-add broadcast-add__message">
    <b-form-radio-group stacked
                        :options="enabledTypes"
                        value-field="id"
                        text-field="label"
                        v-model="type"/>
    <!-- sms -->
    <template v-if="type === 'sms'">
      <!-- composer -->
      <!-- preview -->
    </template>
    <!-- voicemail -->
  </div>
</template>

<script>
export default {
  name: 'broadcast-add-view-message',

  props: {
    contactPreview: {
      type: Object,
      required: false
    }
  },

  computed: {
    isValid () {
      switch (this.type) {
        case 'sms':
          return !!this.message
        default:
          return false
      }
    },

    enabledTypes () {
      return this.types.filter(type => type.enabled)
    }
  },

  data: () => ({
    message: null,
    type: 'sms',
    types: [
      {
        id: 'sms',
        label: 'SMS',
        enabled: true
      },
      {
        id: 'voicemail',
        label: 'Ringless Voicemail',
        enabled: false
      }
    ]
  }),

  watch: {
    isValid (state) {
      this.$emit('input', state)
    }
  }
}
</script>
