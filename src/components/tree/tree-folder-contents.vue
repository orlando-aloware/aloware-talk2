<template>
  <div class="subfolders">
    <tree-folder
      v-for="folder in folders"
      :name="folder.name"
      :key="folder.id"
      :id="folder.id"
      :parent-id="folder.parent_id"
      :order="folder.order"
      :layer="layer"
      :folders="folder.child_folders"
      :lists="folder.lists"
      :hasEdit="hasEdit"
      :hasDelete="hasDelete"
      :endpoint="endpoint"
      data-testid="tree-folder-contents"
    />
  </div>
</template>

<script>
export default {
  components: {
    treeFolder: () => import('./tree-folder.vue')
  },
  props: {
    folders: {
      type: Array
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
    endpoint: {
      type: String,
      default: '/api/v2/contact-folders'
    }
  }
}
</script>
