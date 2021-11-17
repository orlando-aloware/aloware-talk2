<template>
  <div class="t-menu">
    <DirectoryBase
      v-if="false"
      @create-folder="{}"
      title="Power Dialer Lists"
      :directory="list" />
    <div
      v-if="hasEmptyList"
      class="no-list-found px-3 text-grey-7">
      No Lists found
    </div>
    <ContactsFolders
      :is-contact-module-type="false" />
  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import DirectoryBase from './directories/directory-base'
import ContactsFolders from '../contacts/contacts-folders'
import { DIRECTORY_LIST } from 'src/constants/power-dialer/power-dialer-list'

export default {
  name: 'PowerDialerList',
  components: {
    DirectoryBase,
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
      active: ''
      // listItems: [
      //   {
      //     count: 99,
      //     id: 'all',
      //     link: '/power-dialer/',
      //     name: 'My Queue',
      //     to: '/power-dialer'
      //   }
      // ]
    }
  },
  methods: {
    goTo (path) {
      let p1 = this.$route.params?.id
      let p2 = path.id
      if (p1 && p2) {
        if (p1.toString() !== p2.toString()) {
          this.$router.push({ path: `/power-dialer/list/${path.id}` })
        }
      }
    },
    onCreateFolderToggle () {
      this.isCreatingFolder = !this.isCreatingFolder
    }
  }
}
</script>
