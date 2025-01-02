<template>
  <div class="d-flex contact-tags-item popover-items"
       :class="{ 'align-items-center': !seeMoreNewLine, 'flex-column': seeMoreNewLine }"
       v-if="tags.length"
       v-b-popover.hover="popoverOptions">
    <span>
      <i class="fa fa-circle"
         :style="`color: ${tags[0].color};font-size:36%;position: relative; top: -3px;`" />
      <span v-if="tags.length > 1">
        {{ tags[0].name | truncate(17) }}
      </span>
      <span v-else>
        {{ tags[0].name | truncate(27) }}
      </span>
    </span>
    <span :class="`ml-1 text-grey-7 ${seeMoreClass}`"
          v-if="tags.length > 1">
      +{{ (tags.length - 1) }} more
    </span>
  </div>
</template>

<script>
export default {
  name: 'tags-cell-list',

  props: {
    tags: {
      type: Array,
      default: () => [],
      required: true
    },

    seeMoreClass: {
      type: String,
      default: ''
    },

    seeMoreNewLine: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    popoverOptions () {
      return {
        title: '<span class="contact-tags-title">Tags</span>',
        content: this.popoverContent,
        html: true
      }
    },

    popoverContent () {
      return this.tags.map(tag => {
        return `<span class="d-flex align-items-center mb-1">
                  <i class="fa fa-circle mr-1"
                     style="color: ${tag.color}; font-size:50%;"></i>
                  <span>${tag.name}</span>
                </span>`
      }).join('')
    }
  }
}
</script>
