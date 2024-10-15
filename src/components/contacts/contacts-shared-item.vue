<template>
  <div class="folder align-items-center p-0">
    <q-dialog persistent
              v-model="prompt">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">
            Split List
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none"
                        v-if="splitErrorMessage">
          {{ splitErrorMessage }}
        </q-card-section>

        <q-card-actions class="text-primary"
                        align="right"
                        v-show="splitErrorMessage">
          <q-btn label="Ok"
                 flat
                 @click="prompt = false">
          </q-btn>
        </q-card-actions>

        <q-card-section class="q-pt-none"
                        v-if="!splitErrorMessage">
          Split <strong>{{ listName }}</strong> list into smaller lists
        </q-card-section>

        <q-card-section class="q-pt-none"
                        v-show="!loading && !splitErrorMessage">
          <q-select label="Page Size"
                    :options="splitOptions"
                    :option-disable="item => (item === null ? true : item.disabled)"
                    v-model="optionSelected"/>
        </q-card-section>

        <q-card-section class="q-pt-none"
                        v-show="!loading && !splitErrorMessage">
          <span>
            Do you want to keep the original List?
          </span>
          <div>
            <q-radio label="Keep"
                     color="green"
                     :val="true"
                     v-model="keepList"/>
            <q-radio label="Delete"
                     color="red"
                     :val="false"
                     v-model="keepList"/>
          </div>
        </q-card-section>

        <q-card-actions class="text-primary"
                        align="right"
                        v-show="!loading && !splitErrorMessage">
          <q-btn label="Cancel"
                 flat
                 v-close-popup>
          </q-btn>
          <q-btn label="Split"
                 flat
                 @click="splitList">
          </q-btn>
        </q-card-actions>

        <q-card-actions class="q-pt-none"
                        align="center"
                        v-show="loading && !splitErrorMessage">
          <q-spinner-bars color="primary"
                          size="30px"/>
        </q-card-actions>

      </q-card>
    </q-dialog>
    <div class="d-flex align-items-center item"
         data-testid="contacts-shared-list-link"
         :class="[
           isActive && 'router-link-active',
           isExactActive && 'router-link-exact-active'
         ]"
         @click="toggleSidebar($event)">
      <div class="icon d-flex align-items-center">
        <folder-static-icon data-testid="contacts-shared-static-icon"
                            v-if="item.type === ContactListTypes.STATIC">
        </folder-static-icon>
        <folder-dynamic-icon data-testid="contacts-shared-dynamic-icon"
                             v-if="item.type === ContactListTypes.DYNAMIC || !item.type" >
        </folder-dynamic-icon>
      </div>
      <div class="pr-3 flex-grow-1 item-name d-flex align-items-center">
        <span>{{ item.name }}</span>
      </div>
      <button class="folder__option btn btn-link p-0 shadow-0"
              :data-popper-target="'list-' + item.id"
              :id="`contacts-shared-item-option-${item.id}`"
              :ref="`contacts-shared-item-option-${item.id}`"
              v-if="item.type === ContactListTypes.STATIC">
        <folder-option></folder-option>
      </button>
      <b-popover triggers="click blur"
                 placement="bottomright"
                 boundary="window"
                 custom-class="contact-popover"
                 :target="`contacts-shared-item-option-${item.id}`">
        <list-actions :id="item.id"
                      :type="item.type"
                      :contactsCount="item.no_of_contacts"
                      :has-split="1"
                      :has-edit="0"
                      :has-delete="0"
                      :has-pin="0"
                      :has-duplicate="0"
                      :is-pinned="true"
                      @split="onSplit(item)"/>
      </b-popover>
    </div>
  </div>
</template>

<script>
import FolderStaticIcon from 'components/icons/folder-static-icon'
import FolderDynamicIcon from 'components/icons/folder-dynamic-icon'
import * as ContactListTypes from 'src/constants/contacts-list-types'
import { mapActions, mapState } from 'vuex'
import ListActions from 'components/list-actions.vue'
import FolderOption from 'components/icons/folder-option.vue'
import { contactLists, contactsListFiltersMixin } from 'src/plugins/mixins'

export default {
  name: 'contacts-shared-item',

  mixins: [
    contactLists,
    contactsListFiltersMixin
  ],

  components: {
    FolderDynamicIcon,
    FolderStaticIcon,
    FolderOption,
    ListActions
  },
  data () {
    return {
      loading: false,
      ContactListTypes,
      prompt: false
    }
  },
  props: {
    item: {
      type: Object
    }
  },
  computed: {
    ...mapState('contacts', ['unsavedList']),
    ...mapState('auth', ['profile']),
    isContactsRoute () {
      return this.$route.meta.title === 'Contacts'
    },
    isActive () {
      return this.$route.path.includes(`/contacts/list/${this.item.id}`)
    },
    isExactActive () {
      return this.$route.path === `/contacts/list/${this.item.id}`
    }
  },
  mounted () {
    this.$VueEvent.stop('contact_list_created')

    this.$VueEvent.listen('contact_list_created', event => this.handleListCreated(event))
  },
  methods: {
    ...mapActions('contacts', ['setShowContactsListSidebar', 'setUnsavedList']),
    toggleSidebar (event) {
      event.preventDefault()
      if (this.unsavedList) {
        this.$bvModal.msgBoxConfirm('You have an unsaved contact list. This action may caused unsaved contact list data loss. Do you wish to continue?', {
          buttonSize: 'sm',
          okTitle: 'Yes',
          cancelTitle: 'No',
          centered: true
        }).then(confirm => {
          if (confirm) {
            this.handleToggleSidebar()
          }
        })
      } else {
        this.handleToggleSidebar()
      }
    },

    handleToggleSidebar () {
      this.setUnsavedList(null)
      this.setShowContactsListSidebar(false)
      this.$router.push({
        path: '/contacts/list/' + this.item.id,
        query: { type: 'public' },
        meta: { type: 'public' }
      })
    },

    onSplit (list) {
      this.splitErrorMessage = ''
      this.listId = null

      const isAgent = this.profile.role_names.includes('Company Agent')
      if (list.type === ContactListTypes.DYNAMIC || (list.show_in_public_folder && isAgent)) {
        this.splitErrorMessage = 'You are not allowed to split this list.'
      }

      if (list.type === ContactListTypes.STATIC && list.no_of_contacts <= this.minimunContactsToSplit) {
        this.splitErrorMessage = `The list must have more than ${this.minimunContactsToSplit} contacts to be split.`
      }

      this.listName = list.name
      this.disableSizeOptions(list.no_of_contacts)
      this.listId = list.id
      this.prompt = true
    },

    handleListCreated (event) {
      if (!event.contact_list) {
        return
      }

      if (this.isContactsRoute) {
        this.$router.push(`/contacts/list/${event.contact_list.id}?type=public`)
      }

      this.initiateUpdateContactsListFilter()
      this.$VueEvent.fire('fetchContacts', {
        fromRefresh: true,
        clear: true,
        skipCache: true
      })
      this.$VueEvent.fire('fetchContactsLists')

      this.reloadFolders()
    }
  }
}
</script>
