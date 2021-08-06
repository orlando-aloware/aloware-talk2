<template>
  <div class="calls-header">
    <div class="calls-header__label">
      {{ label }}
    </div>
    <div class="">
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
