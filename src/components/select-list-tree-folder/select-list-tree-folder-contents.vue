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
      :lists="filterLists(folder.lists)"
      :hasEdit="hasEdit"
      :hasDelete="hasDelete"
    />
  </div>
</template>

<script>
export default {
  components: {
    treeFolder: () => import('./select-list-tree-folder.vue')
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
    type: {
      type: Number,
      default: null
    }
  },
  methods: {
    filterLists (lists) {
      if (!lists || !this.type) return lists
      return lists.filter(list => list.type === this.type)
    }
  }
}
</script>
