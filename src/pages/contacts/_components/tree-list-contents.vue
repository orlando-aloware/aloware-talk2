<template>
  <div class="sublists">
    <tree-list-item
      v-for="list in lists"
      :name="list.name"
      :key="list.id"
      :id="list.id"
      :layer="layer"
      :type="list.type"
    />
  </div>
</template>

<script>
export default {
  components: {
    treeListItem: () => import('./tree-list-item.vue')
  },
  props: {
    lists: {
      type: Array
    },
    layer: {
      type: Number
    }
  }
}
</script>
