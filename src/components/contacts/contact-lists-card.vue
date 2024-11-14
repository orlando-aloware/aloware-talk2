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
                  v-if="canEditList(list) && !isRemoving"
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
        v-if="contact && selectedList"
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
        <div class="list-wrapper">
          <div class="w-100 mt-1"
               v-if="!showAvailableLists">
            <b-link href="#"
                    class="custom-link text-decoration-none btn-tag-edit d-flex align-items-center"
                    @click="addToList">
              <slot name="button">
                <pencil-o-icon />
                <span class="ml-1">
              Add to List
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
    <div id="contact-list-card-add-to-list"
         class="d-flex justify-content-between">
      <div class="w-100 mt-1"
           v-if="showAvailableLists">
        <q-select
          compact
          use-input
          input-debounce="0"
          behavior="menu"
          map-options
          emit-value
          multiple
          clearable
          option-value="id"
          option-label="name"
          style="width: 100%;"
          v-model="newSelectedListIds"
          :options="addToListOptions"
          @filter="filterNewLists"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>
        <div class="d-flex justify-content-between">
          <b-button type="button" size="sm" variant="light" @click="cancelAddToList">Cancel</b-button>
            <b-button type="button" size="sm"  variant="primary" @click="addContactListItems" :disabled="isAdding">
              <b-spinner
              class="pull-right self-center custom-link text-decoration-none"
              variant="warning"
              type="grow"
              label="Removing contact from list"
              v-if="isAdding"
              small>
            </b-spinner>
            <span> Save </span>
          </b-button>
        </div>
      </div>
    </div>
  </b-card>
</template>

<script>

import PencilOIcon from 'components/icons/pencil-o-icon.vue'
import ListIcon from 'components/icons/list-icon.vue'
import SearchIcon from 'components/icons/search-icon.vue'

import { aclMixin, contactLists } from 'src/plugins/mixins'
import { mapState } from 'vuex'
import RemoveContactListItemConfirmation from 'components/remove-contact-list-item-confirmation.vue'

export default {
  name: 'contact-lists-card',

  mixins: [aclMixin, contactLists],
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

  data () {
    return {
      isLoading: false,
      isRemoving: false,
      isAdding: false,
      prevValue: '',
      iconColor: '#256eff',
      showSearchIcon: true,
      searchQuery: '',
      page: 1,
      perPage: 5,
      newSelectedListIds: null,
      showAvailableLists: false,
      availableLists: null,
      selectedList: null,
      contactLists: null,
      loadedAllPublicLists: null,
      loadedAllPrivateLists: null,
      addToListOptions: null
    }
  },

  computed: {
    ...mapState('auth', [
      'profile'
    ]),

    title () {
      return this.isPublicListsCard ? 'Public Lists' : 'Private Lists'
    },

    isPublicListsCard () {
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

      let lists = this.contactLists.filter(list => list.show_in_public_folder === this.isPublicListsCard)

      // agents can only view private lists owned by them and public lists
      if (!this.isPublicListsCard && !this.isBillingAdminOrAdminOrSupervisor && this.isAgent) {
        // filter only lists that the agent has access to
        lists = lists.filter(list => list.contact_folder_created_by === this.profile.id)
      }

      if (this.searchQuery) {
        lists = lists.filter(list => list.name.toLowerCase().includes(this.searchQuery.toLowerCase()))
      }

      // sort lists by contact_folder_created_by === this.profile.id first
      lists.sort((a, b) => {
        if (a.contact_folder_created_by === this.profile.id) {
          return -1
        }

        if (b.contact_folder_created_by === this.profile.id) {
          return 1
        }

        return 0
      })
      return lists
    },

    computedAvailableLists () {
      // remove deleted
      const lists = this.isPublicListsCard ? this.loadedAllPublicLists : this.loadedAllPrivateLists

      if (!lists) {
        return []
      }
      return lists.filter(list => !this.contactLists.some(contactList => contactList.id === list.id))
    },

    paginatedLists () {
      const start = (this.page - 1) * this.perPage
      const end = start + this.perPage
      return this.lists.slice(start, end)
    }
  },

  beforeMount () {
    this.contactLists = this.contact.contact_lists
    this.loadAvailableLists()
  },

  methods: {
    canEditList (list) {
      if (this.isPublicListsCard) {
        return this.isBillingAdminOrAdminOrSupervisor
      }
      if (list.contact_folder_created_by === this.profile.id) {
        return true
      }
    },
    filterNewLists (val, update) {
      if (val === '') {
        update(() => {
          this.addToListOptions = this.computedAvailableLists
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.addToListOptions = this.computedAvailableLists.filter(list => list.name.toLowerCase().indexOf(needle) > -1)
      })
    },
    addContactListItems () {
      this.isAdding = true
      return this.$axios.post(`/api/v2/contact-list-items-bulk-lists`, {
        contact_id: this.contact.id,
        list_ids: this.newSelectedListIds
      })
        .then(() => {
          this.$generalNotification('The Contact was added to the list successfully.')
          this.addListToContactLists()
        })
        .catch((_err) => {
          this.$generalNotification('Unable to add contact to list. Please try again.', 'error')
        }).finally(() => {
          this.isAdding = false
        })
    },
    addListToContactLists () {
      console.log('addListToContactLists')
      const addedLists = this.computedAvailableLists.filter(list => this.newSelectedListIds.includes(list.id))
      for (let i = 0; i < addedLists.length; i++) {
        console.log('addedLists[i]', addedLists[i])
        this.contactLists.push(addedLists[i])
      }
      this.newSelectedListIds = null
      this.showAvailableLists = false
    },
    onInput (value) {

    },
    onAdd (value) {

    },
    addToList () {
      this.showAvailableLists = true
    },
    cancelAddToList () {
      this.showAvailableLists = false
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
    },

    async loadAvailableLists () {
      let params = {
        page: 1,
        per_page: 99999
      }
      if (this.isPublicListsCard) {
        this.loadedAllPublicLists = await this.getPublicListsV2(params)
      } else {
        params.user_id = this.profile.id
        params.private_only = true
        this.loadedAllPrivateLists = await this.getListsV2(params)
      }
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
