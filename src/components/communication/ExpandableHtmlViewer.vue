<template>
  <div class="html-viewer">
    <div v-html="displayContent"></div>
    <div v-if="isTruncated && !isExpanded"
         class="expand-indicator"
         @click="toggleExpand">
      Show More
    </div>
    <div v-if="isExpanded"
         class="collapse-indicator"
         @click="toggleExpand">
      Show Less
    </div>
  </div>
</template>

<script>
import DOMPurify from 'dompurify'

export default {
  name: 'ExpandableHtmlViewer',
  props: {
    content: {
      type: String,
      required: true
    },
    truncateLength: {
      type: Number,
      default: 500 // Default truncation length
    }
  },
  data () {
    return {
      isExpanded: false,
      isTruncated: false
    }
  },
  computed: {
    sanitizedContent () {
      return DOMPurify.sanitize(this.content)
    },
    displayContent () {
      return this.isExpanded ? this.sanitizedContent : this.getTruncatedContent()
    }
  },
  methods: {
    toggleExpand () {
      this.isExpanded = !this.isExpanded
    },
    getTruncatedContent () {
      const truncated = this.sanitizedContent.slice(0, this.truncateLength)
      this.isTruncated = this.sanitizedContent.length > this.truncateLength
      this.$emit('update:expandable', this.isTruncated)
      return this.isTruncated ? truncated + '...' : truncated
    }
  },
  mounted () {
    // Emit initial value on mount
    this.$nextTick(() => {
      const isExpandable = this.sanitizedContent.length > this.truncateLength
      this.$emit('update:expandable', isExpandable)
    })
  },
  watch: {
    content () {
      // Re-emit when content changes
      this.$nextTick(() => {
        const isExpandable = this.sanitizedContent.length > this.truncateLength
        this.$emit('update:expandable', isExpandable)
      })
    }
  }
}
</script>

<style scoped>
.html-viewer {
  position: relative;
}

.expand-indicator,
.collapse-indicator {
  color: #007bff;
  cursor: pointer;
  margin-top: 5px;
  text-align: center;

  &:hover {
    text-decoration: underline;
  }
}
</style>
