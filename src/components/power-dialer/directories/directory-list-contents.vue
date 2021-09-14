<template>
  <div class="sublists"
    :class="{'is-root': isRootList}">
    <DirectoryListItem
      v-for="list in lists"
      :name="list.name"
      :key="list.id"
      :id="list.id"
      :layer="layer"
      :type="list.type"
      :hasEdit="hasEdit"
      :hasDelete="hasDelete" />
  </div>
</template>

<script>

import DirectoryListItem from './directory-list-item'

export default {
  name: 'DirectoryListContents',
  components: {
    DirectoryListItem
  },
  props: {
    lists: {
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
    isRootList: {
      type: Boolean,
      required: false,
      default: false
    }
  }
}
</script>
