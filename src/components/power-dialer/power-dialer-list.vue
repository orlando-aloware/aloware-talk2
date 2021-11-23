<template>
  <div class="t-menu border-top">
    <ContactsFolders
      v-if="toggleFolders"
      :is-contact-module-type="false" />
  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import ContactsFolders from '../contacts/contacts-folders'
import { DIRECTORY_LIST } from 'src/constants/power-dialer/power-dialer-list'

export default {
  name: 'PowerDialerList',
  components: {
    ContactsFolders
  },
  computed: {
    ...mapGetters('powerDialer', [
      'powerDialerDirectoryList'
    ]),
    list () {
      return this.powerDialerDirectoryList || this.directoryList
    },
    directoryList () {
      return DIRECTORY_LIST
    },
    hasEmptyList () {
      if (this.list[0].child_folders.length < 1 && this.list[0].lists.length < 1) {
        return true
      }
      return false
    }
  },
  data () {
    return {
      isCreatingFolder: false,
      active: '',
      toggleFolders: true
    }
  },
  methods: {},
  watch: {
    '$route': {
      handler (routeObj) {
        if (routeObj.name === 'Power Dialer') {
          this.toggleFolders = true
        } else {
          this.toggleFolders = false
        }
      },
      deep: true
    }
  }
}
</script>
