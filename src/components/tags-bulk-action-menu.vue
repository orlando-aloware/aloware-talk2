<template>
  <div class="bulk-action-menu bulk-action-menu__tags">
    <div class="menu-actions d-flex flex-row">

      <div class="items">
        <span>{{ getSelectedCount }} selected</span>
      </div>

      <div class="items">
        <a href="#"
           @click.prevent="clearAllSelectedTags">
          <i class="fa fa-minus-square"></i>
          Clear All
        </a>
      </div>

      <div class="items"
           v-if="selectedTagCategory === ContactTags">
        <span class="d-inline-block"
              tabindex="0"
              :title="disabledBulkActionsTitle">
          <a id="btn-assign-contacts"
             href="#"
             :disabled="!selectedTagsHasContactsCount"
             @click.prevent="bulkAssignContacts">
            <i class="fa fa-layer-group"></i>
            Assign Contacts
          </a>
        </span>
      </div>

      <div class="items"
           v-if="selectedTagCategory === ContactTags">
        <span class="d-inline-block"
              tabindex="0"
              :title="disabledBulkActionsTitle">
          <a href="#"
             :disabled="!selectedTagsHasContactsCount"
             @click.prevent="bulkAddtoPowerDialer">
            <i class="fa fa-layer-group"></i>
            Add to Power Dialer
          </a>
        </span>
      </div>

      <div class="items"
           v-if="selectedTagCategory === ContactTags">
        <span class="d-inline-block"
              tabindex="0"
              :title="disabledBulkActionsTitle">
          <a href="#"
             :disabled="!selectedTagsHasContactsCount"
             @click.prevent="bulkEnrollContacts">
            <i class="fa fa-layer-group"></i>
            Enroll Contacts
          </a>
        </span>
      </div>

      <div class="items">
        <a href="#"
           class="text-danger"
           @click.prevent="isOpenDeleteTagDialog = true">
          <i class="fa fa-trash text-danger"></i>
          Delete
        </a>
      </div>

    </div>

    <delete-tag-dialog :is-show="isOpenDeleteTagDialog"
                       :is-bulk="true"
                       :tag="{}"
                       v-if="hasSelectedTagIds"
                       @closeDeleteTagDialog="isOpenDeleteTagDialog = false"
                       @reloadTags="reloadTags"/>
  </div>
</template>

<script>
import { tagsMixin } from 'src/plugins/mixins'
import { mapState } from 'vuex'
import DeleteTagDialog from 'components/tags/delete-tag-dialog.vue'

export default {
  name: 'tags-bulk-action-menu',

  components: {
    DeleteTagDialog
  },

  mixins: [
    tagsMixin
  ],

  data () {
    return {
      isOpenDeleteTagDialog: false
    }
  },

  computed: {
    ...mapState('tagsModule', [
      'selectedTagCategory',
      'selectedTagIds',
      'selectedTagsContactsCount'
    ]),

    getSelectedCount () {
      return [...this.selectedTagIds].length
    },

    selectedTagsHasContactsCount () {
      return this.selectedTagCategory === this.ContactTags && this.selectedTagsContactsCount > 0
    },

    disabledBulkActionsTitle () {
      return !this.selectedTagsHasContactsCount ? 'Contacts Count is Empty' : false
    }
  },

  methods: {
    bulkAssignContacts () {

    },

    bulkAddToPowerDialer () {

    },

    bulkEnrollContacts () {

    },

    reloadTags () {
      this.$emit('reloadTags')
    }
  }
}
</script>
