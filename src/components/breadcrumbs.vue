<template>
  <div class="pt-2">
    <div
      v-if="historyMode"
      class="d-flex flex-column">
      <div class="d-flex align-items-center">
        <router-link
          :to="'/power-dialer/list/' + $route.params.id"
          v-slot="{ href, navigate }">
          <a
            class="btn btn-link p-0 text-muted pr-2"
            :href="href"
            @click="navigate">
            <i class="fa fa-chevron-left"></i>
          </a>
        </router-link>
        Add contacts to
        <div class="text-grey-90">
          <span class="title-icon">
            <!-- <folder-static-icon/> -->
          </span>
          {{ breadcrumbs.name }}
        </div>
      </div>
      <div class="text-muted small action-desc">
        Manually select contacts or create a filter
      </div>
    </div>
    <div
      v-else
      class="row breadcrumbs d-flex py-2">
      <div class="breadcrumbs__directory d-flex flex-column">
        <!-- <div class="pr-2">LOL</div> -->
        <div class="small text-muted pt-1">
          {{ breadcrumbs.crumbs }}
        </div>
      </div>
      <div class="breadcrumbs__icon px-2 py-0">
        <ListIcon />
      </div>
      <div class="breadcrumbs__name">
        {{ breadcrumbName }}
      </div>
    </div>
  </div>
</template>

<script>

import { mapGetters, mapMutations } from 'vuex'
import ListIcon from 'components/icons/list-icon'
import { isEmpty } from 'lodash'

export default {
  name: 'Breadcrumbs',
  props: {
    powerDialerList: {
      type: Object,
      default: () => {}
    },
    directoryList: {
      type: Array,
      default: () => {}
    },
    historyMode: {
      type: Boolean,
      default: false
    }
  },
  components: {
    ListIcon
  },
  computed: {
    ...mapGetters([
      'breadcrumbs'
    ]),
    breadcrumbName () {
      let { crumbs, name } = this.breadcrumbs
      return isEmpty(crumbs) && isEmpty(name) ? 'My Queue' : name
    }
  },
  mounted () {
    let id = this.$route.params.id
    this.findParents(this.directoryList, id)
  },
  methods: {
    ...mapMutations([
      'SET_BREADCRUMBS'
    ]),
    findParents (node, searchForId) {
      var breadcrumbs = {}
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
      if (Array.isArray(vNode?.child_folders)) {
        if (vNode.name === 'Root') {
          let rootItem = vNode.lists.find(i => i.id.toString() === searchForId.toString())
          if (rootItem) {
            breadcrumbs = {
              crumbs: '',
              name: rootItem.name
            }
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
              breadcrumbs = {
                crumbs: `${name === 'Root' ? '' : name + ' / '}${treeNode.name} / `,
                name: foundItem.name
              }
            }
          }
        }
      }
      if (!isEmpty(breadcrumbs)) {
        this.SET_BREADCRUMBS(breadcrumbs)
      }
    },
    resetBreabcrumbs () {
      this.SET_BREADCRUMBS({
        crumbs: '',
        name: ''
      })
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
    },
    directoryList (data) {
      let id = this.$route.params.id
      this.findParents(data, id)
    }
  }
}
</script>
