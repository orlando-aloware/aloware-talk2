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

          <q-card-section class="q-pt-none">
            Split <strong>{{ listName }}</strong> list into smaller lists
          </q-card-section>

          <q-card-section class="q-pt-none"
                          v-show="!loading">
            <q-select label="Page Size"
                      :options="options"
                      :option-disable="item => (item === null ? true : item.disabled)"
                      v-model="optionSelected"/>
          </q-card-section>

          <q-card-actions class="text-primary"
                          align="right"
                          v-show="!loading">
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
                          v-show="loading">
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
import API from 'src/plugins/api/api'

export default {
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
      loading: false,
      options: [
        {
          value: 50,
          label: '50',
          disabled: false
        },
        {
          value: 100,
          label: '100',
          disabled: false
        },
        {
          value: 200,
          label: '200',
          disabled: false
        },
        {
          value: 500,
          label: '500',
          disabled: false
        },
        {
          value: 1000,
          label: '1000',
          disabled: false
        }
      ],
      optionSelected: {
        value: 50,
        label: '50',
        disabled: false
      },
      listName: '',
      listId: null
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
      console.log('voy a partir a ', listId, listName, this.optionSelected)
    },

    disableSizeOptions (contactsCount) {
      // Set option as disabled if value >= contactsCount
      this.options.forEach(option => {
        if (option.value >= contactsCount) {
          option.disabled = true
        }
      })
    },

    enableAllSizeOptions () {
      this.options.forEach(option => {
        option.disabled = false
      })
    },

    splitList () {
      this.loading = true

      const data = {
        page_size: this.optionSelected.value
      }

      API.V2.contactsList.splitListIntoSmallerLists(this.listId, data)
        .then(res => {
          this.loading = false
          this.closeDialog()
        }).catch(err => {
          this.$handleErrors(err.response)
          this.loading = false
          console.log(err)
        })
    },

    closeDialog () {
      this.enableAllSizeOptions()
      this.listId = null
      this.listName = ''
      this.optionSelected = {
        value: 50,
        label: '50',
        disabled: false
      }
      this.prompt = false
      this.loading = false

      // reload the page
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    }
  }
}
</script>
