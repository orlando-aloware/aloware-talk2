<template>
  <div>
    <a
      class="page-side-menubar-list-item mx-2 px-1"
      v-bind:class="{
      'page-side-menubar-list-item__active': activeClass,
      'page-side-menubar-list-item--closed': closed,
    }"
      href="/"
      :disabled="disabled"
      @click.prevent="onClick"
      v-if="!group"
    >
      <div
        class="page-side-menubar-list-item__inner"
        v-bind:class="{
          'page-side-menubar-list-item__inner--closed': closed,
          'page-side-menubar-list-item__inner--opened': !closed
      }"
      >
        <div
          class="page-side-menubar-list-item__icon"
          v-bind:class="{
          'page-side-menubar-list-item__icon--closed': closed,
          'page-side-menubar-list-item__icon--opened': !closed
        }"
        >
          <icon :icon="icon" :height="height" :width="width" :isActive="isActive"/>
        </div>
        <div class="page-side-menubar-list-item__label">
          {{ label }}
        </div>
      </div>
    </a>
    <div v-else
         class="inbox-nav-item-group-header mx-2 px-1 text-uppercase">
      {{ label }}
    </div>
  </div>
</template>

<script>
import Icon from './settings-nav-icon.vue'

export default {
  name: 'settings-nav-item',

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
    height: {
      type: [String, Number],
      default: 16
    },
    width: {
      type: [String, Number],
      default: 16
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

  computed: {
    activeClass () {
      return this.value === this.$route.params.tab || (!this.$route.params.tab && this.value === 'general-information')
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
