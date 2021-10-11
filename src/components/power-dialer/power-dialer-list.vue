<template>
  <div class="t-menu">
    <DirectoryBase
      @create-folder="{}"
      title="Power Dialer Lists"
      :directory="list" />
  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import DirectoryBase from './directories/directory-base'
import { DIRECTORY_LIST } from 'src/constants/power-dialer/power-dialer-list'

export default {
  name: 'PowerDialerList',
  components: {
    DirectoryBase
  },
  computed: {
    ...mapGetters('powerDialer', [
      'powerDialerList'
    ]),
    list () {
      return this.powerDialerList || []
    },
    directoryList () {
      return DIRECTORY_LIST
    }
  },
  data () {
    return {
      isCreatingFolder: false,
      active: '',
      listItems: [
        {
          count: 99,
          id: 'all',
          link: '/power-dialer/',
          name: 'My Queue',
          to: '/power-dialer'
        }
      ]
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
