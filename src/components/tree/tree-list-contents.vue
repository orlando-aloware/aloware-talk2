<template>
  <div
    class="sublists"
    :class="{'is-root': isRootList}">
    <template v-if="lists.length">
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
      <tree-list-item class="flex-grow-1 w-100"
                      :name="list.name"
                      :showInPublicFolder="list.show_in_public_folder"
                      :contactsCount="list.no_of_contacts ?? 0"
                      :key="list.id"
                      :id="list.id"
                      :layer="layer"
                      :type="list.type"
                      :hasEdit="hasEdit"
                      :hasDelete="hasDelete"
                      v-for="list in lists"
                      @split="onSplit"
                      @noSplit="onNoSplit"
      />
    </template>
    <tree-list-item
      v-if="hasUnsavedRootList || (hasUnsavedList && isDirectChild)"
      class="flex-grow-1 w-100"
      :name="unsavedList.name"
      :layer="layer"
      :type="unsavedList.type"
      :hasEdit="hasEdit"
      :hasDelete="hasDelete"
    />
    <!-- <tree-list-item
      class="flex-grow-1 w-100"
      :name="unsavedList.name"
      :layer="layer"
      :type="unsavedList.type"
      :hasEdit="hasEdit"
      :hasDelete="hasDelete"
      v-else-if="hasUnsavedList"
    /> -->
  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import { isEmpty } from 'lodash'
import { contactLists } from 'src/plugins/mixins'

export default {
  mixins: [contactLists],

  components: {
    treeListItem: () => import('./tree-list-item.vue')
  },

  props: {
    lists: {
      type: Array
    },
    layer: {
      type: Number
    },
    hasEdit: {
      type: Number
    },
    hasDelete: {
      type: Number
    },
    isRootList: {
      type: Boolean,
      required: false,
      default: false
    },
    folderId: {
      type: [Number, String],
      default: ''
    }
  },

  data () {
    return {
      prompt: false,
      loading: false
    }
  },

  computed: {
    ...mapGetters('contacts', ['unsavedList']),
    hasUnsavedRootList () {
      if (!isEmpty(this.unsavedList)) {
        return this.isRootList && this.unsavedList.contact_folder_id === null
      }
      return false
    },
    hasUnsavedList () {
      if (!isEmpty(this.unsavedList)) {
        return !this.isRootList && this.unsavedList.contact_folder_id !== null
      }
      return false
    },
    isDirectChild () {
      return this.folderId === this.unsavedList.contact_folder_id
    }
  },

  methods: {
    onSplit (listId, listName, contactsCount) {
      this.disableSizeOptions(contactsCount)
      this.listId = listId
      this.listName = listName
      this.prompt = true
    },

    onNoSplit (listName, splitErrorMessage) {
      this.listName = listName
      this.splitErrorMessage = splitErrorMessage
      this.prompt = true
    }
  }
}
</script>
