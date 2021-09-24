<template>
  <div class="sublists">
    <MoveFolderItem
      v-for="folder in folders"
      :name="folder.name"
      :key="folder.id"
      :id="folder.id"
      :folders="folder.child_folders"
      :layer="layer"
    />
  </div>
</template>

<script>

import MoveFolderItem from 'src/components/power-dialer/custom/move-folder-item.vue'
export default {
  name: 'MoveFolderList',
  components: {
    MoveFolderItem
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
