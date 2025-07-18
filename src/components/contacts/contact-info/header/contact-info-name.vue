<template>
  <div class="alw-contact-name-wrapper">
    <q-tooltip
      v-if="showTooltip && !isMobile"
      anchor="top middle"
      content-class="fs-12"
      data-testid="contact-info-name-tooltip"
      self="center middle"
    >
      {{ contactName }}
    </q-tooltip>
    <h2 ref="nameElement" class="alw-contact-name" @mouseenter="checkTruncation" @touchstart="checkTruncation">
      {{ contactName }}
    </h2>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'contact-info-name',
  props: {
    contact: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      showTooltip: false
    }
  },
  computed: {
    ...mapState(['isMobile']),
    contactName () {
      return this.contact?.name || 'No Name'
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.checkTruncation()
    })
  },
  methods: {
    checkTruncation () {
      const element = this.$refs.nameElement
      if (element) {
        // Check if text is truncated either horizontally or vertically
        // Add a 2px threshold to avoid false positives from rounding errors
        const isHorizontallyTruncated = element.scrollWidth > element.clientWidth + 2
        const isVerticallyTruncated = element.scrollHeight > element.clientHeight + 2

        this.showTooltip = isHorizontallyTruncated || isVerticallyTruncated
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.alw-contact-name-wrapper {
  flex: 1 1 0;
}

.alw-contact-name {
  font-size: 18px;
  line-height: 1.15;
  font-weight: 500;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2; // Maximum 2 lines
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;

  @media (min-width: 768px) {
    font-size: 16px;
  }
}
</style>
