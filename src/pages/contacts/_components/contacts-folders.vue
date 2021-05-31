<template>
  <div class="folders">
    <div
      class="folders__header d-flex align-items-center border-bottom border-top"
    >
      <div class="header__header__title font-weight-bold pl-3 flex-grow-1">
        Folders
      </div>

      <b-popover
        target="bs-folder-options"
        triggers="click blur"
        placement="bottomright"
        boundary="window"
        custom-class="contact-popover"
      >
        <contact-menu title="New">
          <contact-menu-item @click="onCreateFolderToggle">
            <template slot="icon">
              <folder-icon></folder-icon>
            </template>
            <template slot="title">
              <span>Folder</span>
            </template>
          </contact-menu-item>

          <contact-menu-item>
            <template slot="icon">
              <folder-static-icon></folder-static-icon>
            </template>
            <template slot="title">
              <span>Static List</span>
            </template>
          </contact-menu-item>

          <contact-menu-item>
            <template slot="icon">
              <folder-dynamic-icon></folder-dynamic-icon>
            </template>
            <template slot="title">
              <span>Dynamic List</span>
            </template>
          </contact-menu-item>
        </contact-menu>
      </b-popover>

      <button
        class="btn btn-link btn-sm tooltip-target mr-1"
        id="bs-folder-options"
      >
        <i class="fa fa-plus text-success"></i>
      </button>
    </div>

    <div class="d-flex folders__content flex-column">
      <tree-folder-create
        v-if="isCreatingFolder"
        :layer="0"
        :parent_id="null"
        @blur="onCreateFolderToggle"
      />
      <tree-folder
        v-for="folder in folders"
        :name="folder.name"
        :key="folder.id"
        :id="folder.id"
        :order="folder.order"
        :hasEdit="folder.has_edit"
        :hasDelete="folder.has_delete"
        :folders="folder.child_folders"
        :lists="folder.lists"
        :layer="0"
      />
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import treeFolder from './tree-folder.vue'
import contactMenu from './contact-menu.vue'
import contactMenuItem from './contact-menu-item.vue'
import folderIcon from 'src/components/icons/folder-icon.vue'
import folderStaticIcon from 'src/components/icons/folder-static-icon.vue'
import folderDynamicIcon from 'src/components/icons/folder-dynamic-icon.vue'
import treeFolderCreate from './tree-folder-create.vue'

export default {
  components: {
    treeFolder,
    contactMenu,
    contactMenuItem,
    folderIcon,
    folderStaticIcon,
    folderDynamicIcon,
    treeFolderCreate
  },
  data () {
    return {
      isCreatingFolder: false,
      isLoading: false
    }
  },
  methods: {
    ...mapActions('contacts', ['foldersLoaded']),
    onCreateFolderToggle () {
      this.isCreatingFolder = !this.isCreatingFolder
    },
    loadFolders () {
      this.isLoading = false
      window.axios
        .get('/api/v2/contact-folders')
        .then((response) => response.data)
        .then(this.foldersLoaded)
        .finally(() => {
          this.isLoading = false
        })
        .catch((err) => {
          console.error(err)
          this.$q.notify({
            message: 'Unable to load folders please try again.',
            type: 'negative',
            textColor: 'white',
            actions: [
              {
                icon: 'close'
              }
            ]
          })
        })
    }
  },
  computed: {
    ...mapState('contacts', ['folders'])
  },
  mounted () {
    this.loadFolders()
  }
}
</script>

<style lang="scss">
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
.folders {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: 500px;
  max-height: calc(100vh - 385px);
  &__header {
    min-height: 40px;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  &__content {
    height: calc(100% - 40px);
    max-height: calc(100% - 40px);
    overflow: auto;
  }
}
.item {
  cursor: pointer;
  font-size: 13px;
  line-height: 34px;
  transition: background-color 100ms ease-in-out;
}
.item:hover {
  background: $light-green2;
}
.contact-popover .popover-body {
  padding: 0;
}
</style>
