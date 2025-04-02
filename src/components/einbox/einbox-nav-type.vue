<template>
  <div :class="['einbox-nav-type', { 'einbox-nav-type--expanded': expanded }, { 'einbox-nav-type--reduced': reduced }]">
    <div class="einbox-nav-type__label">
      {{ label }}
    </div>

    <div class="einbox-nav-type__inboxes"
         @scroll="onScroll">
      <einbox-nav-item :label="inbox.name"
                       :value="inbox.id"
                       :message-count="inbox.message_count"
                       :is-active="activeInboxId === inbox.id"
                       :key="inbox.id"
                       v-for="inbox in typedInboxes"
                       @click="$emit('inbox', inbox.id)" />
    </div>

    <div class="einbox-nav-type__see-more"
         @click="$emit('toggle-expanded', type)">
      See {{ expanded ? 'less' : 'all' }} {{ label }}
    </div>
  </div>
</template>

<script>
import EinboxNavItem from './einbox-nav-item.vue'
import { mapState } from 'vuex'

export default {
  components: {
    EinboxNavItem
  },

  props: {
    type: {
      type: String,
      required: true
    },

    label: {
      type: String,
      required: true
    },

    typedInboxes: {
      type: Array,
      required: true
    },

    activeInboxId: {
      type: Number,
      required: false
    },

    expanded: {
      type: Boolean,
      required: false
    },

    reduced: {
      type: Boolean,
      required: false
    }
  },

  computed: {
    ...mapState('Einbox', [
      'isLoadingInboxes',
      'hasMoreInboxes'
    ])
  },

  methods: {
    onScroll (e) {
      const target = e.target
      const bottomThreshold = 20

      // Check if scrolled to bottom (with a small threshold)
      const isNearBottom = target.scrollHeight - (target.scrollTop + target.clientHeight) <= bottomThreshold

      if (isNearBottom && !this.isLoadingInboxes && this.hasMoreInboxes[this.type]) {
        this.$emit('load-more', this.type)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.einbox-nav-type {
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.5s ease;

  &__label {
    font-weight: 600;
  }

  &__inboxes {
    display: flex;
    flex-direction: column;
    overflow-y: hidden;
  }

  &__see-more {
    font-size: 12px;
    font-weight: 600;
    color: #256EFF;
    cursor: pointer;
    text-align: center;
    margin-top: 5px;
  }

  &--expanded {
    height: 100% !important;

    .einbox-nav-type__inboxes {
      overflow-y: auto;
      flex-grow: 1;
    }
  }

  &--reduced {
    height: 0% !important;
  }
}

</style>
