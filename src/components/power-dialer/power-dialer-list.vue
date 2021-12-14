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
    hasEmptyList () {
      return (this.list[0].child_folders.length < 1 && this.list[0].lists.length < 1)
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
        this.toggleFolders = routeObj.name === 'Power Dialer'
      },
      deep: true
    }
  }
}
</script>
