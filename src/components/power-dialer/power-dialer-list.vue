<template>
  <div class="t-menu border-top">
    <ContactsFolders
      :is-contact-module-type="false">
    </ContactsFolders>
  </div>
</template>

<script>

import ContactsFolders from '../contacts/contacts-folders'

export default {
  name: 'PowerDialerList',
  components: {
    ContactsFolders
  },
  data () {
    return {
      isCreatingFolder: false,
      active: '',
      toggleFolders: true
    }
  },
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
