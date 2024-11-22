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

      <template
        v-for="(item, key) in itemLists">
        <div
          class="folder d-flex align-items-center folder--target1"
          :class="{ 'folder--target': activeId === item.id }"
          :key="key"
          @clicked="{}">

          <div
            class="folder__indent"
            :style="indentStyle">
          </div>

          <div
            @click="onTarget(item)"
            class="folder-item folder__indent flex-grow-1 d-flex align-items-center">
            <div class="folder__name pd-name-create">
              <contact-list-type-icon testIdSuffix='move-folder-list'
                                      :type="item.type" />
              {{ item.name }}
            </div>
          </div>

          <button
            class="folder__option btn btn-link p-0"
            @click="onTarget(item)">
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
import * as ContactListTypes from 'src/constants/contacts-list-types'
import ContactListTypeIcon from 'components/contacts/contact-list-type-icon.vue'

export default {
  name: 'MoveFolderList',
  components: {
    ContactListTypeIcon,
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
      isTarget: '',
      ContactListTypes
    }
  },
  methods: {
    ...mapActions('contacts', ['setCreateDialogTarget']),
    onTarget (item) {
      this.isTarget = item.id
      this.setCreateDialogTarget({
        target: item.id,
        name: item.name
      })
    },
    foldersHasLists (obj) {
      return obj?.lists.length > 0
    }
  }
}
</script>
