<template>
  <div class="row d-flex py-2">
        <div class="d-flex flex-column">
      <!-- <div class="pr-2">LOL</div> -->
      <div class="small text-muted pt-1">
        Outbound Sales / Google Map Scaping /
      </div>
    </div>
    <div class="px-2 py-0">
      <ListIcon />
    </div>
    Chicago
  </div>
</template>

<script>

import ListIcon from 'components/icons/list-icon'

export default {
  name: 'Breadcrumbs',
  props: {
    listObjects: {
      type: Array,
      default: () => {}
    }
  },
  components: {
    ListIcon
  },
  computed: {
    myObj2 () {
      return this.listObjects
    }
  },
  mounted () {
    console.log('---', this.findParents(this.listObjects, 'Untitled List'))
  },
  methods: {
    processCrumbs () {
      // const myObj = [
      //   {
      //     name: '1',
      //     pages: [
      //       {
      //         name: '1.1',
      //         pages: []
      //       },
      //       {
      //         name: '1.2',
      //         pages: []
      //       }
      //     ]
      //   },
      //   {
      //     name: '2',
      //     pages: []
      //   },
      //   {
      //     name: '3',
      //     pages: []
      //   }
      // ]

      // const searchPages = (name, arr) => arr.filter(
      //   ({ pages }) => pages.find(page => page.name === name)
      // )

      // let searchResults = searchPages('1.1', myObj)
      // console.log(searchResults)

      // console.log('this.listObjects :>> ', this.listObjects)

      // setTimeout(() => {
      //   const searchCrumbs = (name, arr) => arr.filter(
      //     ({ childFolders }) => {
      //       console.log('childFolders :>> ', childFolders)
      //       childFolders.find(folder => folder.name === name)
      //     }
      //   )

      //   let result = searchCrumbs('', this.myObj)
      //   console.log('searchCrumbs :>> ', searchCrumbs)
      //   console.log('result :>> ', result)
      // }, 2000)
    },

    findParents (node, searchForName) {
      // If current node name matches the search name, return
      // empty array which is the beginning of our parent result
      if (node.name === searchForName) {
        return []
      }
      // Otherwise, if this node has a tree field/value, recursively
      // process the nodes in this tree array
      if (Array.isArray(node.tree)) {
        for (var treeNode of node.tree) {
          // Recursively process treeNode. If an array result is
          // returned, then add the treeNode.name to that result
          // and return recursively
          const childResult = this.findParents(treeNode, searchForName)
          if (Array.isArray(childResult)) {
            return [ treeNode.name ].concat(childResult)
          }
        }
      }
    }

  },
  watch: {
    '$route.params.id': function (id) {
      console.log('100 :>> ', id)
    },
    '$route.params.filter': function (id) {
      console.log('200 :>> ', id)
    }
  }
}
</script>
