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
          v-if="foldersHasLists"
          :name="folder.name"
          :key="`${folder.id}-${key}`"
          :id="folder.id"
          :folders="folder.child_folders"
          :layer="layer"
          :items="folder.lists"
        />
      </template>
      <!-- <CreateListItem
        v-for="(item, key) in itemLists"
        :id="item.id"
        :key="key"
        :folders="[]"
        :layer="layer"
        :items="[item]"
      /> -->
      <template
        v-for="(item, key) in itemLists">
        <div
          :key="key"
          class="folder d-flex align-items-center folder--target1"
          :class="{ 'folder--target': activeId === item.id }"
          @clicked="{}">

          <div
            class="folder__indent"
            :style="indentStyle">
          </div>

          <div class="folder-item folder__indent flex-grow-1 d-flex align-items-center">
            <div class="folder__name pd-name-create">
              <DialIcon
                color="grey"
                class="mr-1" />
              {{ item.name }}
            </div>
          </div>

          <button
            @click="onTarget(item.id)"
            class="folder__option btn btn-link p-0">
            <i v-if="activeId === item.id"
              class="fa fa-check-circle text-success small">
            </i>
            <i v-else
              class="fa fa-circle small">
            </i>
          </button>

        </div>
      </template>
    </template>
  </div>
</template>

<script>

import { mapActions, mapGetters } from 'vuex'
import MoveFolderItem from 'src/components/power-dialer/custom/move-folder-item.vue'
import CreateListItem from 'src/components/power-dialer/custom/create-list-item.vue'
import DialIcon from 'components/icons/dial-icon'

export default {
  name: 'MoveFolderList',
  components: {
    MoveFolderItem,
    CreateListItem,
    DialIcon
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
  },
  computed: {
    ...mapGetters('powerDialer', [
      'searchedListItem'
    ]),
    ...mapGetters('contacts', [
      'createDialog'
    ]),
    activeId () {
      return this.createDialog.target
    },
    indentStyle () {
      return {
        width: `${(this.layer + 1) * 10}px`
      }
    }
  },
  data () {
    return {
      isTarget: ''
    }
  },
  methods: {
    ...mapActions('contacts', ['setCreateDialogTarget']),
    onTarget (id) {
      this.isTarget = id
      this.setCreateDialogTarget({
        target: id
      })
    },
    foldersHasLists (obj) {
      if (obj?.lists.length > 0) {
        return true
      }
      return false
    }
  }
}
</script>
