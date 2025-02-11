<template>
  <div data-testid="einbox-nav-item"
       class="inbox-nav-item d-flex align-items-center cursor-pointer"
       :class="{ 'inbox-nav-item--active': isActive }"
       @click="$emit('click', value)">
    <div class="inbox-nav-item__content d-flex align-items-center justify-content-between w-100">
      <div class="d-flex align-items-center">
        <q-icon name="inbox"
                size="20px"
                class="q-mr-sm inbox-nav-item__icon" />
        <span class="inbox-nav-item__label">{{ label }}</span>
      </div>
      <!-- <q-badge color="primary"
               class="inbox-nav-item__badge"
               :label="messageCount"
               v-if="messageCount > 0" /> -->
    </div>
  </div>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      required: true
    },

    value: {
      type: [String, Number],
      required: true
    },

    messageCount: {
      type: Number,
      default: 0
    },

    isActive: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
.inbox-nav-item {
  padding: 12px 16px;
  border-radius: 10px 0 0 10px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #4374B0;
  }

  &--active {
    background-color: #256eff;

    .inbox-nav-item__label {
      font-weight: 600;
      color: #fff;
    }
  }

  &__label {
    font-size: 14px;
    color: #424242;
  }

  &__badge {
    font-size: 12px;
    padding: 4px 8px;
  }

  &__icon {
    color: #fff;
  }
}
</style>
