<template>
  <q-btn
    :href="href"
    class="integration-link-btn integration-link-btn--rectangular"
    color="primary"
    dense
    flat
    rel="noopener noreferrer"
    size="md"
    target="_blank"
    @click.stop
  >
    <q-tooltip
      v-if="!isMobile"
      :content-style="{ 'max-width': '200px', 'white-space': 'nowrap' }"
      anchor="top middle"
      content-class="fs-12"
      self="center middle"
    >
      {{ title }}
    </q-tooltip>
    <slot />
  </q-btn>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'contact-info-integration-link',
  props: {
    href: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    inline: {
      type: Boolean,
      default: false
    },
    integrationName: {
      type: String,
      default: ''
    }
  },
  computed: {
    ...mapState(['isMobile'])
  }
}
</script>

<style lang="scss" scoped>
.integration-link-btn {
  &.integration-link-btn--rectangular {
    border-radius: 20px;
    padding: 0 8px;
    box-sizing: border-box;
    width: auto;
    min-width: auto;

    min-height: 2.4em;
    height: 2.4em;
  }
}
</style>
