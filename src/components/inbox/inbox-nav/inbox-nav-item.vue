<template>
  <a
    class="inbox-nav-item"
    v-bind:class="{
      'inbox-nav-item__active': isActive,
      'inbox-nav-item__compressed': isCompressed
    }"
    href="/"
    @click.prevent="onClick"
  >
    <div
      class="inbox-nav-item__inner"
      v-bind:class="{
        'inbox-nav-item__inner--compressed': isCompressed
      }"
    >
      <div
        class="inbox-nav-item__icon"
        v-bind:class="{
          'inbox-nav-item__icon--compressed': isCompressed
        }"
      >
        <icon :icon="icon" :isActive="isActive" />
      </div>
      <div class="inbox-nav-item__label" v-if="!isCompressed">{{ label }}</div>
      <badge
        v-if="badge"
        :color="badgeColor"
        :value="badgeValue"
        :compressed="isCompressed"
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
    isCompressed: {
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
.inbox-nav-item {
  display: flex;
  align-items: center;
  height: 40px;
  color: $grey-dark;
  position: relative;

  &__active {
    background-color: $flesh;
    color: $black;
  }

  &__compressed {
    overflow: hidden;
  }

  &:hover {
    text-decoration: none;
  }

  &__inner {
    padding-left: 20px;
    padding-right: 20px;
    display: flex;
    align-items: center;
    width: 100%;
    &--compressed {
      padding-left: 0;
      padding-right: 0;
      justify-content: center;
    }
  }

  &__icon {
    padding-right: 10px;
    &--compressed {
      padding-right: 0;
    }
  }

  &__label {
    font-weight: bold;
    flex-grow: 1;
  }
}
</style>
