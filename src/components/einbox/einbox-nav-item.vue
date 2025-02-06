<template>
  <div
    class="inbox-nav-item d-flex align-items-center cursor-pointer"
    :class="{ 'inbox-nav-item--active': isActive }"
    @click="$emit('click', value)"
    data-testid="einbox-nav-item"
  >
    <div class="inbox-nav-item__content d-flex align-items-center justify-content-between w-100">
      <div class="d-flex align-items-center">
        <q-icon name="inbox" size="20px" class="q-mr-sm" />
        <span class="inbox-nav-item__label">{{ label }}</span>
      </div>
      <q-badge
        v-if="messageCount > 0"
        color="primary"
        :label="messageCount"
        class="inbox-nav-item__badge"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'EinboxNavItem',

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
  border-radius: 10px 10px 0 0;
  transition: all 0.2s ease;

  &:hover {
    background-color: #99EBAA;
    color: #424242;

    .inbox-nav-item__label {
      color: #424242;
    }
  }

  &--active {
    background-color: #00BD50;
    color: #ffffff;

    .inbox-nav-item__label {
      font-weight: 600;
      color: var(--q-primary);
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
}
</style>
