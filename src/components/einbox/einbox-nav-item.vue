<template>
  <div data-testid="einbox-nav-item"
       :class="['inbox-nav-item', { 'inbox-nav-item--active': isActive }]"
       @click="$emit('click', value)">
    <div class="inbox-nav-item__content d-flex align-items-center">
      <inbox-icon class="inbox-nav-item__icon mr-1"
                  width="24"
                  height="24" />
      <span class="inbox-nav-item__label">{{ label }}</span>
    </div>
  </div>
</template>

<script>
import InboxIcon from 'src/components/icons/inbox/inbox-icon.vue'

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
  },

  components: {
    InboxIcon
  }
}
</script>

<style lang="scss" scoped>
.inbox-nav-item {
  padding: 12px 16px;
  border-radius: 10px;
  transition: all 0.2s ease;
  width: 100%;
  cursor: pointer;

  &:hover {
    background-color: #E9F0FF;
  }

  &__label {
    font-size: 14px;
    max-width: calc(100vw - 75px);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__content {
    width: 100%;
  }

  &__icon {
    font-size: 20px;
  }

  &--active {
    background-color: #E9F0FF;

    &::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      padding: 2px;
      background: linear-gradient(90deg, #7c3aed, #0ea5e9);
      -webkit-mask: linear-gradient(white 0 0) content-box, linear-gradient(white 0 0);
      mask: linear-gradient(white 0 0) content-box, linear-gradient(white 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      pointer-events: none;
      clip-path: inset(0 round 8px);
      border-radius: 8px;
    }
  }

  @media(min-width: 785px) {
    max-width: 235px;

    &__label {
      max-width: 180px;
    }
  }
}
</style>
