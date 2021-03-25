<template>
  <a
    class="inbox-nav-item"
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
      <div class="inbox-nav-item__label" v-bind:class="{
          'inbox-nav-item__label--closed': closed,
          'inbox-nav-item__label--opened': !closed
        }">{{ label }}
      </div>
      <badge
        v-if="badge"
        :color="badgeColor"
        :value="badgeValue"
        :closed="closed"
      />
    </div>
  </a>
</template>

<script>
import Icon from './inbox-nav-icon.vue'
import Badge from './inbox-nav-badge.vue'

export default {
  components: {
    Icon,
    Badge
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
    badgeValue: {
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
    background-color: $flesh;
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

    &--opened {
      padding-left: 20px;
      padding-right: 20px;
    }

    &--closed {
      padding-left: 0;
      padding-right: 0;
    }

    @include screen('lg') {
      padding-left: 20px;
      padding-right: 20px;
    }
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
    line-height: 19px;
    font-weight: bold;
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
}
</style>
