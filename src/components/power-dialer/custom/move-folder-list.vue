<template>
  <div class="sublists">
    <template v-if="action === 'move'">
      <MoveFolderItem
        v-for="folder in folders"
        :name="folder.name"
        :key="folder.id"
        :id="folder.id"
        :folders="folder.child_folders"
        :layer="layer"
      />
    </template>
    <template v-else>
      <template
        v-for="(folder, key) in folders">
        <CreateListItem
          v-if="itemFolders[key].lists.length > 0"
          :name="folder.name"
          :key="folder.id"
          :id="folder.id"
          :folders="folder.child_folders"
          :layer="layer"
          :items="itemFolders[key]"
        />
      </template>
      <CreateListItem
        v-for="(item, key) in itemLists"
        :id="item.id"
        :key="key"
        :folders="[]"
        :layer="layer"
        :items="[item]"
      />
    </template>
  </div>
</template>

<script>

import MoveFolderItem from 'src/components/power-dialer/custom/move-folder-item.vue'
import CreateListItem from 'src/components/power-dialer/custom/create-list-item.vue'

export default {
  name: 'MoveFolderList',
  components: {
    MoveFolderItem,
    CreateListItem
  },
  props: {
    folders: {
      type: Array
    },
    layer: {
      type: Number
    },
    action: {
      type: String,
      default: 'move'
    },
    itemFolders: {
      type: Array,
      default: () => []
    },
    itemLists: {
      type: Array,
      default: () => []
    }
  }
}
</script>
