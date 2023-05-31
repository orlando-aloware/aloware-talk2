<template>
  <treeselect class="q-basic-selector tree-selector"
              placeholder="Select a Power Dialer list"
              search-nested
              :multiple="isMultiple"
              :options="listOptions"
              :clearable="isClearable"
              :show-count="isShowCount"
              :disable-branch-nodes="disableBranchNodes"
              v-model="selectedListId"
              @input="updateValue">

      <label slot="option-label"
             slot-scope="{ node, shouldShowCount, count, labelClassName, countClassName }"
             :class="labelClassName">
        <i class="far fa-folder"
           v-if="node.isBranch">
        </i>
        {{ node.label }}
        <span v-if="shouldShowCount"
              :class="countClassName">
          ({{ count }})
        </span>
      </label>
  </treeselect>
</template>

<script>
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import API from 'src/plugins/api/api'

export default {
  name: 'power-dialer-list-selector',

  components: {
    Treeselect
  },

  props: {
    value: {
      required: false
    },

    userId: {
      type: Number,
      required: false
    },

    isMultiple: {
      type: Boolean,
      default: false
    },

    isClearable: {
      type: Boolean,
      default: false
    },

    isShowCount: {
      type: Boolean,
      default: false
    },

    disableBranchNodes: {
      type: Boolean,
      default: true
    }
  },

  data () {
    return {
      selectedListId: null,
      listOptions: []
    }
  },

  async created () {
    if (this.userId) {
      this.getUserPowerDialerLists()
    }
  },

  methods: {
    getUserPowerDialerLists () {
      const params = {
        user_id: this.userId
      }

      API.V2.powerDialer.userMyQueue(params)
        .then(res => {
          this.getPowerDialerLists()

          // pre-select My Queue list as default
          this.selectedListId = res.data.id
          this.listOptions = [{
            id: res.data.id,
            label: res.data.name
          }]
        })
        .catch(err => {
          this.$handleErrors(err)
          console.log(err)
        })
    },

    getPowerDialerLists () {
      let params = {}
      if (this.userId) {
        params = {
          user_id: this.userId
        }
      }

      API.V2.powerDialerFolders.list(params)
        .then(res => {
          const data = res.data[0]
          const mapList = (list) => {
            return {
              id: list.id,
              label: list.name
            }
          }

          // make tree selection out off nested folders
          if (data?.child_folders && data.child_folders.length > 0) {
            let nestedFolders = []
            const mapFolder = (folder) => {
              let lists = []

              // lists inside folder
              if (folder?.lists && folder.lists.length > 0) {
                lists = folder.lists.map(mapList)
              }

              // folders inside folder
              if (folder?.child_folders && folder.child_folders.length > 0) {
                nestedFolders = folder.child_folders.map(mapFolder)
              }

              return {
                id: folder.id,
                label: folder.name,
                children: [...lists, ...nestedFolders]
              }
            }

            const folders = data.child_folders.map(folder => mapFolder(folder))
            this.listOptions = [...this.listOptions, ...folders]
          }

          // lists in root folder
          if (data?.lists && data.lists.length > 0) {
            const options = data.lists.map(mapList)

            this.listOptions = [...this.listOptions, ...options]
          }
        })
        .catch(err => {
          this.$handleErrors(err)
          console.log(err)
        })
    },

    updateValue (value) {
      this.$emit('change', value)
    },

    resetListOptions () {
      this.listOptions = []
    }
  },

  watch: {
    async userId (value) {
      if (!value) {
        return
      }

      this.resetListOptions()
      this.getUserPowerDialerLists()
    }
  }
}
</script>
