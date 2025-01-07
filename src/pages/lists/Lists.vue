<template>
  <lists-table :title="'Lists'" />
</template>

<script>
import ListsTable from 'src/components/lists/lists-table'

export default {
  name: 'Lists',

  components: {
    ListsTable
  }
}
</script>
