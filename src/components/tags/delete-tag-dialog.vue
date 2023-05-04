<template>
  <b-modal :title="`Delete ${tagCategoryName} Tag`"
           no-close-on-esc
           no-close-on-backdrop
           size="md"
           v-model="openModal"
           @hidden="closeDeleteTagDialog">
    <span>
      Deleting <span class="font-italic font-weight-bold">{{ tagName }}</span> tag will remove it from all contacts and communications. Continue?
    </span>

    <b-form-checkbox v-show="showDeleteContactsQuestion"
                     v-model="isDeleteContacts"
                     value="yes"
                     unchecked-value="no"
                     class="mt-4">
      Do you also want to delete the tagged contacts of this tag?
    </b-form-checkbox>

    <div class="text-left break-word mt-4 mb-0"
            v-show="showConfirmDeleteInfo">
      <p>
          You're about to delete <span class="font-weight-bold">{{ (tag?.contacts_count || 0) | numFormat }} contacts</span>.
          Use the text field below to confirm the number of contacts you want to delete.
      </p>
      <b-form-input placeholder="Confirm number of contacts here"
                    v-model="confirmDeleteContactsCount"/>
    </div>

    <template #modal-footer>
      <div class="mt-2 d-flex w-100">
        <div class="ml-auto">
            <button class="btn btn-sm btn-outline-dark mr-2"
                    @click.prevent="closeDeleteTagDialog">
              Cancel
            </button>
            <button class="btn btn-sm btn-danger text-white"
                    @click.prevent="deleteTag">
              Delete
            </button>
        </div>
      </div>
    </template>
  </b-modal>
</template>

<script>
import { tagsMixin } from 'src/plugins/mixins'
export default {
  name: 'delete-tag-dialog',

  mixins: [
    tagsMixin
  ],

  props: {
    isShow: {
      type: Boolean,
      required: true
    },

    tag: {
      type: Object,
      required: false
    }
  },

  data () {
    return {
      isDeleteContacts: 'no',
      confirmDeleteInfo: false,
      confirmDeleteContactsCount: null
    }
  },

  computed: {
    openModal: {
      get () {
        return this.isShow
      },

      set (isShow) {
        return isShow
      }
    },

    tagName () {
      return this?.tag?.name || ''
    },

    showDeleteContactsQuestion () {
      if (!this.tag) {
        return false
      }

      return this?.tag?.category === this.ContactTags &&
              this?.tag?.contacts_count > 0 &&
              !this.confirmDeleteInfo
    },

    showConfirmDeleteInfo () {
      if (!this.tag) {
        return false
      }

      return this?.tag?.category === this.ContactTags &&
              this.isDeleteContacts === 'yes' &&
              this.confirmDeleteInfo
    }
  },

  methods: {
    reset () {
      this.isDeleteContacts = 'no'
      this.confirmDeleteInfo = false
    },

    closeDeleteTagDialog () {
      this.reset()
      this.$emit('closeDeleteTagDialog')
    },

    deleteTag () {
      console.log(this.tag)
    }
  },

  watch: {
    isDeleteContacts (value) {
      if (value === 'yes') {
        this.confirmDeleteInfo = true
        return
      }

      this.confirmDeleteInfo = false
    }
  }
}
</script>
