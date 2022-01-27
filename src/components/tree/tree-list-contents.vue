<template>
  <div
    class="sublists"
    :class="{'is-root': isRootList}"
    v-if="lists.length">
    <tree-list-item
      class="flex-grow-1 w-100"
      v-for="list in lists"
      :name="list.name"
      :key="list.id"
      :id="list.id"
      :layer="layer"
      :type="list.type"
      :hasEdit="hasEdit"
      :hasDelete="hasDelete"
    />
    <tree-list-item
      class="flex-grow-1 w-100"
      :name="unsavedList.name"
      :layer="layer"
      :type="unsavedList.type"
      :hasEdit="hasEdit"
      :hasDelete="hasDelete"
      v-if="hasUnsavedRootList || (hasUnsavedList && isDirectChild)"
    />
    <!-- <tree-list-item
      class="flex-grow-1 w-100"
      :name="unsavedList.name"
      :layer="layer"
      :type="unsavedList.type"
      :hasEdit="hasEdit"
      :hasDelete="hasDelete"
      v-else-if="hasUnsavedList"
    /> -->
  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import { isEmpty } from 'lodash'

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
    },
    folderId: {
      type: [Number, String],
      default: ''
    }
  },
  computed: {
    ...mapGetters('contacts', ['unsavedList']),
    hasUnsavedRootList () {
      if (!isEmpty(this.unsavedList)) {
        return this.isRootList && this.unsavedList.contact_folder_id === null
      }
      return false
    },
    hasUnsavedList () {
      if (!isEmpty(this.unsavedList)) {
        return !this.isRootList && this.unsavedList.contact_folder_id !== null
      }
      return false
    },
    isDirectChild () {
      return this.folderId === this.unsavedList.contact_folder_id
    }
  }
}
</script>
