import API from 'src/plugins/api/api'
import { mapActions } from 'vuex'

export default {
  data () {
    return {
      minimunContactsToSplit: 50,
      listId: null,
      keepList: true,
      isConvertedListPublic: false,
      listName: '',
      splitErrorMessage: '',
      splitOptions: [
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
      }
    }
  },
  computed: {
    isContactsRoute () {
      return this.$route.meta.title === 'Contacts'
    },
    foldersPath () {
      return this.isContactsRoute ? '/api/v2/contact-folders' : '/api/v2/power-dialer-folders'
    }
  },
  methods: {
    ...mapActions('contacts', [
      'foldersLoaded'
    ]),

    reloadFolders () {
      return this.$axios
        .get(this.foldersPath)
        .then((response) => response.data)
        .then(this.foldersLoaded)
        .catch((_err) => {
          this.$generalNotification('Unable to load folders please try again.', 'error')
        })
    },

    disableSizeOptions (contactsCount) {
      // Set option as disabled if value >= contactsCount
      this.splitOptions.forEach(option => {
        if (option.value >= contactsCount) {
          option.disabled = true
        }
      })
    },

    enableAllSizeOptions () {
      this.splitOptions.forEach(option => {
        option.disabled = false
      })
    },

    splitList () {
      this.loading = true

      const data = {
        page_size: this.optionSelected.value,
        keep_original: this.keepList
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
    }
  }
}
