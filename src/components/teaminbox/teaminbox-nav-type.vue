<template>
  <div class="teaminbox-nav-type"
       v-if="typedInboxes.length">
    <div class="teaminbox-nav-type__label">
      {{ label }}
    </div>

    <div class="teaminbox-nav-type__inboxes">
      <div ref="inboxesInner">
        <teaminbox-nav-item :label="inbox.name"
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
import TeamInboxNavItem from './teaminbox-nav-item.vue'

export default {
  components: {
    TeamInboxNavItem
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
.teaminbox-nav-type {
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
