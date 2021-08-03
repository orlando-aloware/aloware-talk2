<template>
  <div>
    <a
      class="inbox-nav-item mx-2 px-1"
      v-bind:class="{
      'inbox-nav-item__active': isActive,
      'inbox-nav-item--closed': closed,
    }"
      href="/"
      :disabled="disabled"
      @click.prevent="onClick"
      v-if="!group"
    >
      <div
        class="inbox-nav-item__inner"
        v-bind:class="{
        'inbox-nav-item__inner--closed': closed,
         'inbox-nav-item__inner--opened': !closed
      }"
      >
        <div
          class="inbox-nav-item__icon"
          v-bind:class="{
          'inbox-nav-item__icon--closed': closed,
          'inbox-nav-item__icon--opened': !closed
        }"
        >
          <icon :icon="icon" :isActive="isActive"/>
        </div>
        <div class="inbox-nav-item__label">
          {{ label }}
        </div>
        <span class="count-label"
              v-if="value === 'inbox'">
        <span class="open-count border-right">{{ openCount }}</span>
        <span class="pending-count ml-2">{{ pendingCount }}</span>
      </span>
        <refresh-icon :isActive="isActive"
                      v-if="value === 'inbox'"/>
        <!--badge
          v-if="badge"
          :color="badgeColor"
          :value="badgeValue"
          :closed="closed"
        /-->
      </div>
    </a>
    <div v-else
         class="inbox-nav-item-group-header mx-2 px-1 text-uppercase">
      {{ label }}
    </div>
  </div>
</template>

<script>
import Icon from './inbox-nav-icon.vue'
import RefreshIcon from 'components/icons/contacts/refresh-icon'

export default {
  name: 'inbox-nav-item',

  components: {
    RefreshIcon,
    Icon
  },

  props: {
    label: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: false
    },
    closed: {
      type: Boolean,
      default: false
    },
    badge: {
      type: Boolean,
      default: false
    },
    openCount: {
      type: [Number, String],
      default: 0
    },
    pendingCount: {
      type: [Number, String],
      default: 0
    },
    badgeColor: {
      type: String,
      default: 'default'
    },
    group: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    onClick () {
      if (this.disabled) {
        return
      }
      this.$emit('click', this.value)
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
@import 'src/css/breakpoints.scss';

.inbox-nav-item-group-header {
  padding: 10px 5px 10px 10px !important;
  color: #666666;
  letter-spacing: 1px;
}

.inbox-nav-item {
  @include border-radius(10px);
  display: flex;
  align-items: center;
  height: 40px;
  color: $grey-dark;
  position: relative;
  overflow: hidden;
  transition: background-color 100ms ease-in;

  &--closed {
    overflow: hidden;
  }

  &__active {
    background-color: $grey-50;
    color: $black;
  }

  @include screen('lg') {
    overflow: auto;
  }

  &:hover {
    text-decoration: none;
  }

  &__inner {
    display: flex;
    align-items: center;
    width: 100%;
    justify-content: center;
    padding-left: 5px;
    padding-right: 5px;
  }

  &__icon {
    padding-right: 10px;
  }

  &__label {
    font-size: 14px;
    line-height: 17px;
    letter-spacing: -0.0025em;
    flex-grow: 1;

    &--opened {
      display: block;
    }

    &--closed {
      display: none;
    }

    @include screen('lg') {
      display: block;
      &--closed {
        display: none;
      }
    }
  }

  .count-label {
    font-size: 13px;
    line-height: 16px;
    font-weight: 500;
    letter-spacing: 8px;
    color: $grey-30;
  }

  .open-count {
    color: $grey-20;
  }

  .pending-count {
    font-weight: 500;
  }
}
</style>
