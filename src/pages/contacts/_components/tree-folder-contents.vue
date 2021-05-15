<template>
  <div class="subfolders">
    <tree-folder
      v-for="folder in folders"
      :name="folder.name"
      :key="folder.id"
      :id="folder.id"
      :order="folder.order"
      :layer="layer"
      :folders="folder.child_folders"
      :lists="folder.lists"
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
    }
  }
}
</script>
