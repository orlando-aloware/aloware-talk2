<template>
  <div class="q-pa-md q-gutter-sm">
    <q-tree
      :nodes="directory"
      node-key="label"
      no-connectors
      :expanded.sync="expanded"
      default-expand-all>
      <template v-slot:default-header="prop" class="p-0">
        <div class="row items-center">
          <slot :item="prop.node" />
        </div>
      </template>
    </q-tree>
  </div>
</template>

<script>

export default {
  name: 'DirectoryFolder',
  props: {
    directory: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      expanded: [ 'Satisfied customers (with avatar)', 'Good food (with icon)' ]
    }
  }
}
</script>
