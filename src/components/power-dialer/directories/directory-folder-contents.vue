<template>
  <div class="subfolders pl-0">
    <TreeFolder
      v-for="folder in folders"
      :key="folder.id"
      :name="folder.name"
      :id="folder.id"
      :order="folder.order"
      :layer="layer"
      :folders="folder.child_folders"
      :lists="folder.lists"
      :hasEdit="hasEdit"
      :hasDelete="hasDelete" />
  </div>
</template>

<script>

export default {
  name: 'DirectoryFolderContents',
  components: {
    TreeFolder: () => import('./directory-folder.vue')
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
    }
  }
}
</script>
