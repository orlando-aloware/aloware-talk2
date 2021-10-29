<template>
  <div class="row breadcrumbs d-flex py-2">
    <div class="breadcrumbs__directory d-flex flex-column">
      <!-- <div class="pr-2">LOL</div> -->
      <div class="small text-muted pt-1">
        {{ crumbs }}
      </div>
    </div>
    <div class="breadcrumbs__icon px-2 py-0">
      <ListIcon />
    </div>
    <div class="breadcrumbs__name">
      {{ name }}
    </div>
  </div>
</template>

<script>

import ListIcon from 'components/icons/list-icon'

export default {
  name: 'Breadcrumbs',
  props: {
    directoryList: {
      type: Array,
      default: () => {}
    }
  },
  components: {
    ListIcon
  },
  mounted () {
    let id = this.$route.params.id
    this.findParents(this.directoryList, id)
  },
  data () {
    return {
      crumbs: '',
      name: ''
    }
  },
  methods: {
    findParents (node, searchForId) {
      let vNode = null
      if (Array.isArray(node)) {
        vNode = node[0]
      } else {
        vNode = node
      }
      // If current node name matches the search name, return
      // empty array which is the beginning of our parent result
      if (node.id === searchForId) {
        return []
      }
      // Otherwise, if this node has a tree field/value, recursively
      // process the nodes in this tree array
      if (Array.isArray(vNode.child_folders)) {
        if (vNode.name === 'Root') {
          let rootItem = vNode.lists.find(i => i.id.toString() === searchForId.toString())
          if (rootItem) {
            this.crumbs = ''
            this.name = rootItem.name
          }
        }
        for (var treeNode of vNode.child_folders) {
          let name = vNode.name
          // Recursively process treeNode. If an array result is
          // returned, then add the treeNode.name to that result
          // and return recursively
          const childResult = this.findParents(treeNode, searchForId)
          if (Array.isArray(childResult)) {
            return [ treeNode.name ].concat(childResult)
          } else {
            let foundItem = treeNode.lists.find(i => i.id.toString() === searchForId.toString())
            if (foundItem) {
              this.crumbs = `${name === 'Root' ? '' : name + ' / '}${treeNode.name} / `
              this.name = foundItem.name
            }
          }
        }
      }
    },
    resetBreabcrumbs () {
      this.crumbs = ''
      this.name = ''
    }
  },
  watch: {
    '$route.params.id': function (id) {
      if (id === 'in-queue') {
        this.resetBreabcrumbs()
      } else {
        this.findParents(this.directoryList, id)
      }
    },
    '$route.params.filter': function (filter) {
      this.findParents(this.directoryList, filter)
    }
  }
}
</script>
