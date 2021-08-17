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
        <span class="open-count border-right pr-1">{{ openCount | numberPlusFormatter(99) }}</span>
        <span class="pending-count ml-1">{{ pendingCount | numberPlusFormatter(99) }}</span>
      </span>
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

export default {
  name: 'inbox-nav-item',

  components: {
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
