<template>
  <router-link :to="item.to"
               :key="item.id"
               v-if="item.name"
               v-slot="{ href, route, navigate, isActive, isExactActive }">
    <a :href="href"
       :class="[
            isActive && 'router-link-active',
            isExactActive && 'router-link-exact-active'
          ]"
       class="d-flex align-items-center item"
       data-testid="contacts-shared-list-link"
       @click="toggleSidebar($event, route)">
      <div class="icon d-flex align-items-center">
        <folder-static-icon v-if="item.type === ContactListTypes.STATIC" data-testid="contacts-pinned-static-icon" ></folder-static-icon>
        <folder-dynamic-icon v-if="item.type === ContactListTypes.DYNAMIC || !item.type" data-testid="contacts-pinned-dyamic-icon" ></folder-dynamic-icon>
      </div>
      <div class="pr-3 flex-grow-1 item-name d-flex align-items-center">
        <span>{{ item.name }}</span>
      </div>
      <!--div class="counts d-flex align-items-center">
        <b-badge pill
                 variant="light text-muted">
          <span v-if="countsLoading"
                class="ml-1">
            <q-spinner-tail size="12px"
                            color="blue" />
          </span>
          <span v-else>
            {{ listCount | fixCount }}
          </span>
        </b-badge>
      </div-->
    </a>
  </router-link>
</template>

<script>
import FolderStaticIcon from 'components/icons/folder-static-icon'
import FolderDynamicIcon from 'components/icons/folder-dynamic-icon'
import * as ContactListTypes from 'src/constants/contacts-list-types'
import { mapActions, mapGetters, mapState } from 'vuex'
import { isNaN } from 'lodash'

export default {
  name: 'contacts-pinned-item',
  components: {
    FolderDynamicIcon,
    FolderStaticIcon
  },
  data () {
    return {
      loading: false,
      ContactListTypes
    }
  },

  props: {
    item: {
      type: Object
    },
    countsLoading: {
      default: true,
      type: Boolean,
      required: false
    }
  },

  computed: {
    ...mapState('contacts', [
      'unsavedList'
    ]),
    ...mapGetters('contacts', [
      'selectedList'
    ]),
    listCount () {
      let listCount = 0

      if (this.id === this.item.id) {
        listCount = this.item.count !== this.selectedList.contactCount ? this.selectedList.contactCount : this.item.count
      } else {
        listCount = this.item.count
      }

      return !isNaN(listCount) && listCount !== undefined ? listCount : 0
    },
    id () {
      return this.$route.params.id
    }
  },

  methods: {
    ...mapActions('contacts', ['setShowContactsListSidebar', 'setUnsavedList']),
    toggleSidebar (event, route) {
      event.preventDefault()
      if (this.unsavedList) {
        this.$bvModal.msgBoxConfirm('You have an unsaved contact list. This action may caused unsaved contact list data loss. Do you wish to continue?', {
          buttonSize: 'sm',
          okTitle: 'Yes',
          cancelTitle: 'No',
          centered: true
        }).then(confirm => {
          if (confirm) {
            this.handleToggleSidebar(route)
          }
        })
      } else {
        this.handleToggleSidebar(route)
      }
    },

    handleToggleSidebar (route) {
      this.setUnsavedList(null)
      this.setShowContactsListSidebar(false)
      this.$router.push({
        path: route.path
      })
    }
  }
}
</script>
