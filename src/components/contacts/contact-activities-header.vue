<template>
  <div class="calls-header d-flex justify-content-between">
    <div class="calls-header__label">
      {{ label }}
    </div>
    <q-btn
      borderless
      flat
      no-caps
      type="a"
      color="primary"
      class="text-decoration-none mr-2"
      v-if="hasUnreads"
      @click="$emit('markAllAsRead')">
      <span class="mx-2">
        Mark All as Read
      </span>
    </q-btn>
  </div>
</template>

<script>
export default {
  name: 'contact-activities-header',

  props: {
    label: {
      type: String,
      required: true
    },
    hasUnreads: {
      type: Boolean,
      required: false,
      default: false
    }
  }
}
</script>
