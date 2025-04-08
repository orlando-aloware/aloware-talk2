<template>
  <div :class="['einbox-nav-type', { 'einbox-nav-type--expanded': expanded }, { 'einbox-nav-type--reduced': reduced }]"
       v-if="typedInboxes.length">
    <div class="einbox-nav-type__label">
      {{ label }}
    </div>

    <div class="einbox-nav-type__inboxes blue-scroll"
         ref="inboxes"
         @scroll="onScroll">
      <div ref="inboxesInner">
        <einbox-nav-item :label="inbox.name"
                         :value="inbox.id"
                         :message-count="inbox.message_count"
                         :is-active="activeInboxId === inbox.id"
                         :key="inbox.id"
                         v-for="inbox in typedInboxes"
                         @click="$emit('inbox', inbox.id)" />
      </div>
    </div>

    <div class="einbox-nav-type__see-more"
         v-if="showSeeButton"
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

  data: () => ({
    showSeeButton: true
  }),

  computed: {
    ...mapState('Einbox', [
      'isLoadingInboxes',
      'hasMoreInboxes'
    ])
  },

  mounted () {
    window.addEventListener('resize', this.onResize)
    this.onResize() // immediate trigger
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
    },

    onResize () {
      if (!this.$refs.inboxesInner || !this.$refs.inboxes) {
        return
      }

      const inboxesInnerHeight = this.$refs.inboxesInner.getBoundingClientRect().height
      const inboxesHeight = this.$refs.inboxes.getBoundingClientRect().height

      // always show if expanded, otherwise show if inner is greater than outer (means hidden contents)
      this.showSeeButton = this.expanded ? true : inboxesInnerHeight > inboxesHeight
    }
  },

  watch: {
    typedInboxes () {
      this.$nextTick(() => {
        this.onResize()
      })
    }
  },

  beforeDestroy () {
    window.removeEventListener('resize', this.onResize)
  }
}
</script>

<style lang="scss" scoped>
.einbox-nav-type {
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.5s ease;
  max-height: 100%;

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
    max-height: 100% !important;

    .einbox-nav-type__inboxes {
      overflow-y: auto;
      flex-grow: 1;
    }
  }

  &--reduced {
    max-height: 0% !important;
  }
}

</style>
