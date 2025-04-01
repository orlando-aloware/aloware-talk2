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
      <b-button variant="link"
                size="sm"
                :disabled="isLoadingMore"
                @click="$emit('load-more')">
        <span v-if="isLoadingMore">
          <i class="fa fa-spinner fa-spin mr-1"></i>
          Loading...
        </span>
        <span v-else>Load More</span>
      </b-button>
    </div>
  </div>
</template>

<script>
export default {
  components: {
    selectListTreeListItem: () => import('./select-list-tree-list-item.vue')
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
