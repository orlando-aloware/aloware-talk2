<template>
  <div class="sublists">
    <select-list-tree-list-item
      class="select-list-tree-list-item"
      v-for="list in lists"
      :name="list.name"
      :key="list.id"
      :id="list.id"
      :layer="layer"
      :type="list.type"
      :hasEdit="hasEdit"
      :hasDelete="hasDelete"
    />
    <div v-if="hasMore" class="d-flex justify-content-center mt-2">
      <compact-btn variant="outlined-light"
                   size="sm"
                   :disabled="isLoadingMore"
                   @clicked="$emit('load-more')">
        <span v-if="isLoadingMore">
          <i class="fa fa-spinner fa-spin mr-1"></i>
          Loading...
        </span>
        <span v-else>Load More</span>
      </compact-btn>
    </div>
  </div>
</template>

<script>
import CompactBtn from 'src/components/compact-btn.vue'

export default {
  components: {
    selectListTreeListItem: () => import('./select-list-tree-list-item.vue'),
    CompactBtn
  },

  props: {
    lists: {
      type: Array,
      required: true
    },
    layer: {
      type: Number
    },
    hasEdit: {
      type: Number
    },
    hasDelete: {
      type: Number
    },
    hasMore: {
      type: Boolean,
      default: false
    },
    isLoadingMore: {
      type: Boolean,
      default: false
    }
  }
}
</script>
