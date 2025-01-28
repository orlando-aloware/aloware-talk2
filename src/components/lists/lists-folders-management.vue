<template>
  <div class="pt-0 pl-0 pr-0 mb-0 h-100 bordered-right contacts-left-sidebar">
    <div class="mycard d-flex flex-column h-100 border-0 no-border-radius contacts-sidebar-card">
      <nav-item badge-value="20"
                badge-color="danger"
                data-testid="inbox-nav-list-nav-item"
                label="Public Lists"
                value="public"
                class="mt-2"
                :is-active="isPublicLists"
                :closed="false"
                :badge="true"
                :open-count="1"
                :pending-count="2"
                :disabled="isLoading"
                @click="togglePublicLists(true)" />
      <nav-item badge-value="20"
                badge-color="danger"
                data-testid="inbox-nav-list-nav-item"
                value="private"
                class="mt-2"
                :label="privateListsLabel"
                :is-active="!isPublicLists"
                :closed="false"
                :badge="true"
                :open-count="1"
                :pending-count="2"
                :disabled="isLoading"
                @click="togglePublicLists(false)" />

      <div class="mt-2 pt-2 border-top"
           v-if="!isPublicLists">
        <div class="p-2"
             v-if="isAdmin">
          <p class="text-muted custom-input-label mb-0">User</p>
          <user-selector :generic-styling="false"
                         :disabled="isLoading"
                         v-model="userId"
                         @change="setUserId" />
        </div>

        <lists-folders :is-contact-module-type="isContactModuleType"
                       :user-id="userId" />

        <contacts-sidebar-loader v-if="isLoading" />

        <remove-folder-dialog :user-id="userId" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import UserSelector from 'components/generic-selectors/user-selector'
import ContactsSidebarLoader from 'components/contacts/contacts-sidebar-loader'
import ListsFolders from 'components/lists/lists-folders/lists-folders'
import NavItem from 'components/lists/lists-nav-item'
import RemoveFolderDialog from 'components/remove-folder.vue'
import { aclMixin } from 'src/plugins/mixins'

export default {
  name: 'lists-folders-management',

  components: {
    UserSelector,
    ContactsSidebarLoader,
    ListsFolders,
    NavItem,
    RemoveFolderDialog
  },

  props: {
    isContactModuleType: {
      type: Boolean,
      default: true
    },

    isLoading: {
      type: Boolean,
      default: false
    }
  },

  mixins: [
    aclMixin
  ],

  computed: {
    ...mapState('auth', ['profile']),

    ...mapState('contacts', [
      'folders'
    ]),

    userId () {
      if (this.$route.query.user_id && this.isAdmin) {
        return +this.$route.query.user_id
      }

      return this.profile.id
    },

    foldersEndpoint () {
      return this.isContactModuleType
        ? '/api/v2/contact-folders'
        : '/api/v2/power-dialer-folders'
    },

    privateListsLabel () {
      return this.isAdmin ? 'Private Lists' : 'My Lists'
    },

    isFolderEmpty () {
      return (
        !this.folders?.[0]?.child_folders.length &&
        !this.folders?.[0]?.lists.length
      )
    },

    foldersLength () {
      return this.folders?.length
    },

    isPublicLists () {
      return this.$route.query.publicLists === '1'
    }
  },

  data () {
    return {}
  },

  methods: {
    setUserId (userId) {
      this.updateQueryParam('user_id', userId, true)
    },

    updateQueryParam (key, value, removeOthers = false) {
      if (removeOthers) {
        const query = {
          [key]: value
        }
        this.$router.replace({ query })
        return
      }

      const query = Object.assign({}, this.$route.query)
      query[key] = value
      this.$router.replace({ query })
    },

    removeQueryParam (key) {
      const query = Object.assign({}, this.$route.query)
      if (Array.isArray(key)) {
        for (const k of key) {
          delete query[k]
        }
      } else {
        delete query[key]
      }
      this.$router.replace({ query }).catch(() => {})
    },

    togglePublicLists (enabled) {
      if (enabled) {
        this.updateQueryParam('publicLists', 1, true)
      } else {
        this.removeQueryParam(['publicLists', 'folder_id'])
      }
    }
  }
}
</script>
