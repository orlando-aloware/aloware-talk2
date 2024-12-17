<template>
  <div class="d-flex flex-column truncate-chip-labels"
       v-if="tags?.length">
    <!--TODO: chequear el color -->
    <tag :name="firstTag.name"
         :color="firstTag.color" />
    <span class="text-primary ml-1 cursor-pointer"
          v-if="restOfTags.length"
          :id="`tags-more-${_uid}`"
    >
      + {{ restOfTags.length }} more
    </span>
    <b-popover triggers="hover"
               :target="`tags-more-${_uid}`"
               v-if="restOfTags.length">
      <span class="d-block mb-1"
            v-for="tag in restOfTags"
            :key="tag.id"
      >
        <tag :name="tag.name"
             :color="tag.color" />
      </span>
    </b-popover>
  </div>
  <span v-else> - </span>
</template>
<script>
import { first } from 'lodash'
import Tag from './tag'

export default {
  name: 'CommunicationsTags',
  components: {
    Tag
  },
  props: {
    tags: {
      type: Array,
      default: () => [],
      required: true
    }
  },
  computed: {
    firstTag () {
      return first(this.tags) || {}
    },
    restOfTags () {
      return this.tags.slice(1)
    }
  }
}
</script>
