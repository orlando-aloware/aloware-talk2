<template>
  <a
    class="inbox-nav-item mx-2"
    v-bind:class="{
      'inbox-nav-item__active': isActive,
      'inbox-nav-item--closed': closed,
    }"
    href="/"
    @click.prevent="onClick"
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
</template>

<script>
import Icon from './inbox-nav-icon.vue'
import RefreshIcon from 'components/icons/contacts/refresh-icon'

export default {
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
    }
  },
  methods: {
    onClick () {
      this.$emit('click', this.value)
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
@import 'src/css/breakpoints.scss';

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
    padding-left: 0;
    padding-right: 0;
    justify-content: center;
    padding-left: 5px;
    padding-right: 5px;
  }

  &__icon {
    padding-right: 0;
    @include screen('lg') {
      padding-right: 10px;
    }

    &--opened {
      padding-right: 10px;;
    }

    &--closed {
      padding-right: 0 !important;
    }
  }

  &__label {
    font-size: 14px;
    line-height: 17px;
    letter-spacing: -0.0025em;
    flex-grow: 1;
    display: none;

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
