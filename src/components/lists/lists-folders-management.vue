<template>
  <div class="pt-0 pl-0 pr-0 mb-0 h-100 bordered-right contacts-left-sidebar">
    <div
      class="mycard d-flex flex-column h-100 border-0 no-border-radius contacts-sidebar-card"
    >
      <div class="p-2">
        <p>User</p>
        <user-selector
          clearable
          :generic-styling="false"
          v-model="userId"
          @change="setUserId"
        />
      </div>

      <div class="item-empty" v-if="!this.userId">
        <span class="fs-12 text-muted px-2">
          Please select a user to view folders
        </span>
      </div>
      <contacts-folders
        :is-contact-module-type="isContactModuleType"
        :user-id="userId"
        v-else
      />

      <contacts-sidebar-loader v-if="isLoading" />
    </div>
  </div>
</template>

<script>
import UserSelector from 'components/generic-selectors/user-selector.vue'
// import TreeFolder from '../tree/tree-folder.vue'
// import TreeFolderCreate from '../tree/tree-folder-create.vue'
import ContactsSidebarLoader from 'components/contacts/contacts-sidebar-loader'
import ContactsFolders from 'components/contacts/contacts-folders.vue'

export default {
  name: 'lists-folders-management',

  components: {
    UserSelector,
    // TreeFolder,
    // TreeFolderCreate,
    ContactsSidebarLoader,
    ContactsFolders
  },

  props: {
    isContactModuleType: {
      type: Boolean,
      default: true
    }
  },

  computed: {
    foldersEndpoint () {
      return this.isContactModuleType
        ? '/api/v2/contact-folders'
        : '/api/v2/power-dialer-folders'
    },

    hasShowInPublicFolderPermission () {
      return true
    },

    isFolderEmpty () {
      return (
        !this.folders?.[0]?.child_folders.length &&
        !this.folders?.[0]?.lists.length
      )
    },

    foldersLength () {
      return this.folders?.length
    }
  },

  data () {
    return {
      isLoading: false,
      userId: null,
      folders: [],
      removedFolder: null,
      isCreatingFolder: false
    }
  },

  mounted () {
    if (this.$route.query.user_id) {
      this.userId = +this.$route.query.user_id
    }
  },

  methods: {
    setUserId (userId) {
      this.userId = userId

      if (userId) {
        this.updateQueryParam('user_id', userId)
      } else {
        this.removeQueryParam('user_id')
      }
    },

    updateQueryParam (key, value) {
      const query = Object.assign({}, this.$route.query)
      query[key] = value
      this.$router.push({ query })
    },

    removeQueryParam (key) {
      const query = Object.assign({}, this.$route.query)
      delete query[key]

      this.$router.replace({ query })
    },

    loadFolders () {
      this.isLoading = true
      // this.setMyListsLoaded(false)
      this.$axios
        .get(`${this.foldersEndpoint}?user_id=${this.userId}`)
        .then((response) => {
          this.folders = response.data
        })
        .catch((err) => {
          this.folders = []
          console.error(err)
          this.$generalNotification(
            'Unable to load folders please try again.',
            'error'
          )
          // this.setMyListsLoaded(true)
          this.isLoading = false
        })
        .finally(() => {
          this.isLoading = false
          // this.setMyListsLoaded(true)
        })
    },

    onCreateFolderCancel () {
      //
    }
  },

  watch: {
    userId () {
      // if (this.userId) {
      //   this.loadFolders()
      // }
    }
  }
}
</script>
