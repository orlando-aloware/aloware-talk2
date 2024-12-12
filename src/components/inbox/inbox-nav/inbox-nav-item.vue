<template>
  <div data-testid="inbox-nav-item-wrapper">
    <hr class="nav-item-separator"
        v-if="value === 'voicemails' || label === 'Channels'"/>

    <a class="inbox-nav-item mx-2 px-1"
       href="/"
       data-testid="inbox-nav-item-link"
       :class="navItemClass"
       :disabled="disabled"
       v-if="!group"
       @click.prevent="onClick">
      <div class="inbox-nav-item__inner"
           :class="navItemInnerClass">
        <div class="inbox-nav-item__icon"
             :class="navItemIconClass">
          <i class="fa fa-circle text-10"
             data-testid="inbox-nav-item-i"
             v-if="icon === 'view'">
          </i>
          <icon :icon="icon"
                :isActive="isActive"
                data-testid="inbox-nav-item-icon"
                v-if="icon !== 'view'"/>
        </div>
        <div class="inbox-nav-item__label h-100 text-truncate">
          <q-tooltip data-testid="inbox-nav-item-tooltip">
            {{ tooltip || label }}
          </q-tooltip>
          {{ label }}
        </div>
        <span class="count-label h-100"
              v-if="value === 'inbox' && isContactStatusControlEnabled">
          <span class="border-right pr-1"
                v-if="isLoadingOpenTaskCount">
            <q-spinner-tail size="12px"
                            data-testid="inbox-nav-item-spinner-tail-open-task"
                            color="blue" />
          </span>
          <span class="open-count border-right pr-1"
                data-testid="inbox-nav-item-open-count"
                v-if="!isLoadingOpenTaskCount">
            {{ openCount | numberPlusFormatter(99) }}
          </span>

          <span class="ml-1"
                v-if="isLoadingPendingTaskCount">
            <q-spinner-tail size="12px"
                            data-testid="inbox-nav-item-spinner-tail-pending-task"
                            color="blue" />
          </span>
          <span class="pending-count ml-1"
                v-if="!isLoadingPendingTaskCount"
                data-testid="inbox-nav-item-pending-count">
            {{ pendingCount | numberPlusFormatter(99) }}
          </span>
        </span>

        <span class="count-label h-100"
              v-if="customCount !== null">
          <span class="open-count pr-1"
                data-testid="inbox-nav-item-custom-count">
            {{ customCount | numberPlusFormatter(99) }}
          </span>
        </span>
      </div>
    </a>
    <div class="inbox-nav-item-group-header mx-2 px-1 text-uppercase" data-testid="inbox-nav-item-label"
         v-else>
      {{ label }}
    </div>

    <slot name="action-icon"/>
  </div>
</template>

<script>
import Icon from './inbox-nav-icon.vue'
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'inbox-nav-item',

  components: {
    Icon
  },

  computed: {
    ...mapState('inbox', [
      'isLoadingOpenTaskCount',
      'isLoadingPendingTaskCount'
    ]),

    ...mapGetters('cache', ['isContactStatusControlEnabled']),

    navItemClass () {
      return {
        'inbox-nav-item__active': this.isActive,
        'inbox-nav-item--closed': this.closed
      }
    },

    navItemInnerClass () {
      return {
        'inbox-nav-item__inner--closed': this.closed,
        'inbox-nav-item__inner--opened': !this.closed
      }
    },

    navItemIconClass () {
      return {
        'inbox-nav-item__icon--closed': this.closed,
        'inbox-nav-item__icon--opened': !this.closed
      }
    }
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
    },

    customCount: {
      type: Number,
      default: null
    },

    tooltip: {
      type: String,
      default: null
    }
  },

  methods: {
    onClick (e) {
      if (this.disabled) {
        return
      }

      this.$emit('click', this.value)
    }
  }
}
</script>
