<template>
  <div class="sublists">
    <move-folder-item
      v-for="folder in folders"
      :name="folder.name"
      :key="folder.id"
      :id="folder.id"
      :layer="layer"
    />
  </div>
</template>

<script>
export default {
  components: {
    MoveFolderItem: () => import('./move-folder-item.vue')
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
