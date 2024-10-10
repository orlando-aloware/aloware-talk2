<template>
  <b-modal id="tag-convert-to-list-modal"
           modal-class="tags__modal"
           size="md"
           data-testid="tags-convert-to-list-modal"
           centered
           v-model="openModal"
           @hide="closeModalPrompt">
    <b-overlay data-testid="tags-convert-to-list-loading"
               rounded="sm"
               no-wrap
               v-show="loading">
      <template #overlay>
        <q-spinner-bars color="primary"
                        size="30px" />
      </template>
    </b-overlay>

    <template #modal-title>
      <h6 data-testid="tags-convert-to-list-modal-title">
        {{ formName }}
      </h6>
    </template>

    <b-tabs content-class="mt-3"
            v-model="selectedTabIndex">
      <b-tab title="User List"
             title-item-class="user-list-tab-link">
        <p>Convert into a list of contacts for this user</p>
        <user-selector :generic-styling="false"
                       v-model="userId"
                       @change="setUserId" />
      </b-tab>

      <b-tab title="Public List"
             title-item-class="public-list-tab-link">
        <p>Convert into a public list of contacts</p>
      </b-tab>
    </b-tabs>

    <p class="text-13 mt-2 mb-0"
       data-testid="tags-convert-to-list-p-tag-name"
       v-html="`<span class='font-weight-bold'>Tag:</span> ${ tagName }`"/>

    <template #modal-footer>
      <div class="mt-2 d-flex w-100">
        <div class="ml-auto">
          <button class="btn btn-sm btn-outline-dark mr-2"
                  data-testid="tags-convert-to-list-cancel-button"
                  @click.prevent="closeModalPrompt">
            Cancel
          </button>
          <button class="btn btn-sm btn-primary text-white"
                  data-testid="tags-convert-to-list-assign-button"
                  :disabled="!selectedTabIndex && !userId"
                  @click.prevent="converToList">
            Convert
          </button>
        </div>
      </div>
    </template>
  </b-modal>
</template>

<script>
import UserSelector from 'components/generic-selectors/user-selector.vue'
import { tagsMixin } from 'src/plugins/mixins'
import API from 'src/plugins/api/api'

export default {
  name: 'convert-to-list',

  mixins: [
    tagsMixin
  ],

  components: {
    UserSelector
  },

  props: {
    tag: {
      type: Object,
      required: false
    },

    isShow: {
      type: Boolean,
      required: true
    }
  },

  data () {
    return {
      loading: false,
      selectedTabIndex: 0,
      userId: null
    }
  },

  computed: {
    openModal: {
      get () {
        if (this.isShow) {
          // Set data-testid attribute to the user and ring group tab links
          this.$nextTick(() => {
            const userListTabLink = document.querySelector('.user-list-tab-link a')
            const publicListTabLink = document.querySelector('.public-list-tab-link a')
            if (userListTabLink && publicListTabLink) {
              userListTabLink.setAttribute('data-testid', 'tags-convert-to-list-user-tab')
              publicListTabLink.setAttribute('data-testid', 'tags-convert-to-list-ring-group-tab')
            }
          })
        }
        return this.isShow
      },

      set (isShow) {
        return isShow
      }
    },

    tabName () {
      return this.selectedTabIndex === 1 ? 'public_list' : 'user_list'
    },

    tabNameLabel () {
      return this.tabName.replace('_', ' ')
    },

    formName () {
      return `Convert to List`
    }
  },

  methods: {
    closeModalPrompt (bvModalEvent) {
      if (!this.userId) {
        this.closeModal()
        return
      }

      bvModalEvent.preventDefault()

      this.$bvModal.msgBoxConfirm(`Are you sure you want to close the ${this.formName} form?`, {
        title: `Close ${this.formName}`,
        okTitle: 'Yes, I\'m sure',
        cancelTitle: 'No, I\'m not',
        size: 'sm',
        buttonSize: 'sm',
        centered: true
      })
        .then(confirm => {
          if (confirm) {
            this.closeModal()
          }
        })
    },

    closeModal () {
      this.$emit('closeConvertToListModal')
      this.reset()
    },

    reset () {
      this.selectedTabIndex = 0
      this.userId = null
      this.distributeContacts = false
    },

    setUserId (userId) {
      this.userId = userId
    },

    converToList () {
      this.loading = true

      const msg = `Are you sure you want the contacts under this tag to be part of a new ${this.tabNameLabel}?`

      this.$bvModal.msgBoxConfirm(msg, {
        title: 'Event Confirmation',
        okTitle: 'Yes',
        cancelTitle: 'No',
        size: 'sm',
        buttonSize: 'sm',
        centered: true
      })
        .then(confirm => {
          if (!confirm) {
            this.loading = false
            return
          }

          this.convert()
        })
    },

    convert () {
      const listType = this.tabName
      const showInPublicFolder = listType === 'public_list' ? 1 : 0

      const payload = {
        source_tag_id: this.tag.id,
        name: this.tag.name,
        user_id: listType === 'user_list' ? this.userId : null,
        show_in_public_folder: showInPublicFolder
      }

      API.V1.tags.convertTagToList(payload)
        .then(res => {
          this.loading = false
          this.closeModal()

          const list = res.data.data
          list.show_in_public_folder = showInPublicFolder
          this.$emit('listConverted', list)
        }).catch(err => {
          this.$handleErrors(err.response)
          this.loading = false
          console.log(err)
        })
    }
  }
}
</script>
