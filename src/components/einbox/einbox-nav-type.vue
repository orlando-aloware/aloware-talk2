<template>
  <div class="einbox-nav-type"
       v-if="typedInboxes.length">
    <div class="einbox-nav-type__label">
      {{ label }}
    </div>

    <div class="einbox-nav-type__inboxes">
      <div ref="inboxesInner">
        <einbox-nav-item :label="inbox.name"
                         :value="inbox.id"
                         :message-count="inbox.message_count"
                         :is-active="activeInboxId === inbox.id"
                         :key="inbox.id"
                         v-for="inbox in typedInboxes"
                         @click="$emit('inbox', inbox.id)" />
      </div>
    </div>
  </div>
</template>

<script>
import EinboxNavItem from './einbox-nav-item.vue'

export default {
  components: {
    EinboxNavItem
  },

  props: {
    type: {
      type: String,
      required: true
    },

    label: {
      type: String,
      required: true
    },

    typedInboxes: {
      type: Array,
      required: true
    },

    activeInboxId: {
      type: Number,
      required: false
    }
  }
}
</script>

<style lang="scss" scoped>
.einbox-nav-type {
  display: flex;
  flex-direction: column;
  transition: all 0.5s ease;

  &__label {
    font-weight: 600;
  }

  &__inboxes {
    display: flex;
    flex-direction: column;
    overflow-y: hidden;
  }
}
</style>
