<template>
  <div>
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
    <b-row>
      <b-col sm="10"
             class="pl-0 pr-0 ml-0 mr-0">
        <router-link :to="{ path: '/contacts/list/' + item.id, query : { type: 'public' }, meta : { type: 'public' }}"
                     :key="item.id"
                     v-slot="{ href, route, navigate, isActive, isExactActive }">
          <a class="d-flex align-items-center item"
             data-testid="contacts-shared-list-link"
             :href="href"
             :class="[
               isActive && 'router-link-active',
               isExactActive && 'router-link-exact-active'
             ]"
             @click="toggleSidebar($event, route)">
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
          </a>
        </router-link>
      </b-col>
      <b-col sm="2"
             class="pl-0 pr-0 ml-0 mr-0">
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
          <list-actions :list-id="item.id"
                        :type="item.type"
                        :contactsCount="item.no_of_contacts"
                        :hasSplit="1"
                        :hasEdit="0"
                        :hasDelete="0"
                        :hasPin="0"
                        :hasDuplicate="0"
                        :isPinned="true"
                        @split="onSplit(item)"/>
        </b-popover>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import FolderStaticIcon from 'components/icons/folder-static-icon'
import FolderDynamicIcon from 'components/icons/folder-dynamic-icon'
import * as ContactListTypes from 'src/constants/contacts-list-types'
import { mapActions, mapState } from 'vuex'
import ListActions from 'components/list-actions.vue'
import FolderOption from 'components/icons/folder-option.vue'
import { contactLists } from 'src/plugins/mixins'

export default {
  name: 'contacts-shared-item',

  mixins: [contactLists],

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
    ...mapState('auth', ['profile'])
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

      if (list.type === ContactListTypes.STATIC && list.no_of_contacts <= 50) {
        this.splitErrorMessage = 'The list must have more than 50 contacts to be split.'
      }

      this.listName = list.name
      this.disableSizeOptions(list.no_of_contacts)
      this.listId = list.id
      this.prompt = true
    }
  }
}
</script>
