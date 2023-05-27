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
              :title="disabledBulkActionTitle">
          <a id="btn-assign-contacts"
             href="#"
             :disabled="!selectedTagsHasContactsCount"
             @click.prevent="isOpenAssignContactsTagDialog = true">
            <i class="fa fa-sign-in-alt"></i>
            Assign Contacts
          </a>
        </span>
      </div>

      <div class="items"
           v-if="selectedTagCategory === ContactTags">
        <span class="d-inline-block"
              tabindex="0"
              :title="disabledBulkActionTitle">
          <a href="#"
             :disabled="!selectedTagsHasContactsCount"
             @click.prevent="isOpenAddTagContactsToPowerDialerDialog = true">
            <i class="fa fa-phone"></i>
            Add to Power Dialer
          </a>
        </span>
      </div>

      <div class="items"
           v-if="selectedTagCategory === ContactTags">
        <span class="d-inline-block"
              tabindex="0"
              :title="disabledBulkActionTitle">
          <a href="#"
             :disabled="!selectedTagsHasContactsCount"
             @click.prevent="isOpenEnrollTagContactsToSequenceDialog = true">
            <i class="fa fa-user-plus"></i>
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

    <assign-contacts-by-tag :is-show="isOpenAssignContactsTagDialog"
                            :is-bulk="true"
                            :tag="{}"
                            v-if="selectedTagsHasContactsCount"
                            @closeAssignContactsTagModal="isOpenAssignContactsTagDialog = false"/>

    <tag-contacts-add-to-power-dialer :is-show="isOpenAddTagContactsToPowerDialerDialog"
                                      :is-bulk="true"
                                      :tag="{}"
                                      v-if="selectedTagsHasContactsCount"
                                      @closeAddTagContactsToPowerDialer="isOpenAddTagContactsToPowerDialerDialog = false"/>

    <tag-contacts-workflow-enroller :is-show="isOpenEnrollTagContactsToSequenceDialog"
                                    :is-bulk="true"
                                    :tag="{}"
                                    v-if="selectedTagsHasContactsCount"
                                    @closeEnrollTagContactsToSequenceDialog="isOpenAddTagContactsToPowerDialerDialog = false"/>

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
import AssignContactsByTag from 'components/tags/assign-contacts-by-tag.vue'
import TagContactsAddToPowerDialer from 'components/tags/tag-contacts-add-to-power-dialer.vue'
import TagContactsWorkflowEnroller from 'components/tags/tag-contacts-workflow-enroller.vue'

export default {
  name: 'tags-bulk-action-menu',

  components: {
    TagContactsWorkflowEnroller,
    TagContactsAddToPowerDialer,
    AssignContactsByTag,
    DeleteTagDialog
  },

  mixins: [
    tagsMixin
  ],

  data () {
    return {
      isOpenDeleteTagDialog: false,
      isOpenAssignContactsTagDialog: false,
      isOpenAddTagContactsToPowerDialerDialog: false,
      isOpenEnrollTagContactsToSequenceDialog: false
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

    disabledBulkActionTitle () {
      return !this.selectedTagsHasContactsCount ? 'Contacts Count is Empty' : false
    }
  },

  methods: {
    reloadTags () {
      this.$emit('reloadTags')
    }
  }
}
</script>
