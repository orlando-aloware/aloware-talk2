<template>
  <b-card class="border-0 contact-lists-card"
          data-testid="contact-lists-card">
    <div id="contact-lists-card-header"
         class="d-flex justify-content-between">
      <h4 class="me-auto">{{ title }}</h4>
      <span>
        <b-link href="#"
                class="custom-link text-decoration-none btn-tag-edit d-flex align-items-center"
                v-if="showSearchIcon"
                @click="onSearch">
          <slot name="button">
            <q-tooltip anchor="top middle"
                       self="center middle">
              Search current lists
            </q-tooltip>
            <search-icon class="search-icon"
                         :color="iconColor" />
          </slot>
        </b-link>
        <q-input placeholder="Search List name"
                 dense
                 class="form-control form-control-search"
                 v-model="searchQuery"
                 borderless
                 clearable
                 data-testid="search-input"
                 ref="searchListNameInput"
                 v-show="!showSearchIcon"
        >
          <template v-slot:prepend>
            <search-icon />
          </template>
          <template v-if="searchQuery === ''" v-slot:append>
           <q-icon class="cursor-pointer"
                   name="cancel"
                   size="14px"
                   @click.stop.prevent="clearSearch" />
         </template>
        </q-input>
      </span>
    </div>
    <div id="contact-lists-card-body"
         class="my-3">
      <template v-for="(list, index) in paginatedLists">
        <div class="d-flex align-items-start list-item"
             :key="list.id"
        >
          <list-icon class="mr-3 self-center"
                     :key="'list_icon_' + list.id + index" />
          <div class="list-name pr-1">
            <q-tooltip anchor="top middle"
                       self="center middle"
            >
              {{ list.name }}
            </q-tooltip>
            <span ref="listNamesRef">{{ list.name }}</span>
          </div>
          <b-link class="self-center trash-icon custom-link text-decoration-none btn-tag-edit d-flex align-items-center"
                  href="#"
                  v-if="isPublicList && canEditLists && !isRemoving"
          >
            <slot name="button">
              <span class='aloicons trash-icon'
                    :style="'color:' + iconColor + '!important'"
                    @click.prevent="removeContactFromList(list)">B
              </span>
            </slot>
          </b-link>
          <b-spinner
            class="self-center trash-icon custom-link text-decoration-none btn-tag-edit d-flex align-items-center"
            variant="warning"
            type="grow"
            label="Removing contact from list"
            small
            v-if="isRemoving && selectedList?.id === list.id">
          </b-spinner>
        </div>
      </template>
      <remove-contact-list-item-confirmation
        :dialogId="dialogId"
        :contact="contact"
        :list="selectedList"
        v-if="isPublicList && canEditLists && contact && selectedList"
        @deleting="onDeleting"
        @deleted="onDeleted"
        @finally="onFinally"
      />
      <div v-if="lists.length === 0">
        <div class="d-flex justify-content-center align-items-center mt-1"
             style="height: 100%;">
          No available lists.
        </div>
      </div>
    </div>
    <div id="contact-list-card-footer"
         class="d-flex justify-content-between">
      <div class="generic-multi-select">
        <div class="list-wrapper"
             v-if="canEditLists">
          <div class="w-100 mt-1">
            <b-link href="#"
                    class="custom-link text-decoration-none btn-tag-edit d-flex align-items-center"
                    @click="onUpdate">
              <slot name="button">
                <pencil-o-icon />
                <span class="ml-1">
              Modify Lists
            </span>
              </slot>
            </b-link>
          </div>
        </div>
      </div>
      <div class="contact-list-card-pagination">
        <div class="paginated flex flex-center"
             v-if="Math.ceil(lists.length / perPage) > 1">
          <q-pagination class="table-pagination"
                        data-testid="contacts-lists-pagination"
                        padding="0 5px"
                        direction-links
                        dense
                        :ellipses="false"
                        :boundary-numbers="false"
                        :max="Math.ceil(lists.length / perPage)"
                        :max-pages="2"
                        v-model="page">
          </q-pagination>
        </div>

      </div>
    </div>
  </b-card>
</template>

<script>

import PencilOIcon from 'components/icons/pencil-o-icon.vue'
import ListIcon from 'components/icons/list-icon.vue'
import SearchIcon from 'components/icons/search-icon.vue'

import { aclMixin } from 'src/plugins/mixins'
import { mapState } from 'vuex'
import RemoveContactListItemConfirmation from 'components/remove-contact-list-item-confirmation.vue'

export default {
  name: 'contact-lists-card',

  mixins: [aclMixin],
  components: {
    RemoveContactListItemConfirmation,
    PencilOIcon,
    ListIcon,
    SearchIcon
  },

  props: {
    contact: {
      required: true
    }
  },

  computed: {
    ...mapState('auth', [
      'profile'
    ]),

    title () {
      return this.isPublicList ? 'Public Lists' : 'Private Lists'
    },

    isPublicList () {
      return this.$vnode.key === 'contact-public-lists-card'
    },

    dialogId () {
      if (!this.contact || !this.selectedList) {
        return ''
      }

      return `remove-contact-list-item-confirmation-dialog_${this.contact.id}_${this.selectedList.id}`
    },

    lists () {
      if (!this.contactLists) {
        return []
      }

      let lists = this.contactLists.filter(list => list.show_in_public_folder === this.isPublicList)

      if (!this.isBillingAdminOrAdminOrSupervisor && this.isAgent) {
        // filter only lists that the agent has access to
        lists = lists.filter(list => list.contact_folder_created_by === this.profile.id)
      }

      if (this.searchQuery) {
        lists = lists.filter(list => list.name.toLowerCase().includes(this.searchQuery.toLowerCase()))
      }

      return lists
    },

    paginatedLists () {
      const start = (this.page - 1) * this.perPage
      const end = start + this.perPage
      return this.lists.slice(start, end)
    },

    canOnlyViewLists () {
      return !this.isBillingAdminOrAdminOrSupervisor && this.isAgent
    },

    canEditLists () {
      return this.isBillingAdminOrAdminOrSupervisor
    }
  },

  data () {
    return {
      isLoading: false,
      isRemoving: false,
      prevValue: '',
      iconColor: '#256eff',
      showSearchIcon: true,
      searchQuery: '',
      page: 1,
      perPage: 5,
      selectedList: null,
      contactLists: null
    }
  },

  beforeMount () {
    this.contactLists = this.contact.contact_lists
  },

  methods: {
    onInput (value) {

    },

    onUpdate () {

    },

    onSearch () {
      this.showSearchIcon = false
      // TODO: focus on input when showing it
      // this.$refs.searchListNameInput.focus() did not work
      // this.$refs.searchListNameInput.$el.lastChild.children[0].children[1].firstChild.focus() neither
    },
    clearSearch () {
      this.searchQuery = ''
      this.showSearchIcon = true
    },
    removeContactFromList (list) {
      // prevent multiple clicks
      if (this.isRemoving) {
        return
      }

      this.selectedList = list

      // workaround to show modal after the list is selected.
      // The modal was not being shown sometimes when the list was selected
      // and the button had to be clicked twice to show the modal.
      // Adding a small delay "fixes" the issue
      setTimeout(() => {
        this.$bvModal.show(this.dialogId)
      }, 100)
    },
    onDeleting () {
      this.isRemoving = true
    },
    onDeleted () {
      // remove selected contact from list
      this.contactLists = this.contactLists.filter(list => list.id !== this.selectedList.id)
    },
    onFinally () {
      this.isRemoving = false
      this.$bvModal.hide(this.dialogId)
    },

    isEllipsisActive (index) {
      const test = this.$refs
      if (test.listNamesRef) {
        const element = this.$refs.listNamesRef[index]
        console.log('this.$refs.listNamesRef', element, element.offsetWidth < element.scrollWidth)
        // return true
        return element.offsetWidth < element.scrollWidth
      }

      return false
    }
  },
  watch: {
    'contact.id': function () {

    }
  }
}
</script>
<style scoped>
.list-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trash-icon {
  margin-left: auto;
  opacity: 0;
  transition: opacity 0.3s;
}

.list-item:hover .trash-icon {
  opacity: 1;
}
</style>
