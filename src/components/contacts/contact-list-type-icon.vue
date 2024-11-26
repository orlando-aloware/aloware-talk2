<template>
  <span style='margin-top: -4px'>
    <folder-static-icon color="#62666E"
                         :data-testid="`contacts-${testIdSuffix}-static-icon`"
                        v-if="isStatic">
      <q-tooltip anchor="top middle" self="center middle">Static List</q-tooltip>
    </folder-static-icon>
    <folder-dynamic-icon color="#00bf4a"
                         :data-testid="`contacts-${testIdSuffix}-dynamic-remote-icon`"
                         v-if="isDynamicRemote">
      <q-tooltip anchor="top middle" self="center middle">Dynamic List from Integration</q-tooltip>
    </folder-dynamic-icon>
    <folder-dynamic-icon color="#62666E"
                         :data-testid="`contacts-${testIdSuffix}-dynamic-icon`"
                         v-if="isDynamic">
      <q-tooltip anchor="top middle" self="center middle">Dynamic List</q-tooltip>
    </folder-dynamic-icon>
  </span>
</template>

<script>
import FolderDynamicIcon from 'components/icons/folder-dynamic-icon'
import FolderStaticIcon from 'components/icons/folder-static-icon'
import * as ContactListTypes from 'src/constants/contacts-list-types'
export default {
  components: { FolderStaticIcon, FolderDynamicIcon },
  props: {
    type: {
      type: Number,
      required: true
    },
    testIdSuffix: {
      type: String,
      default: 'generic'
    }
  },
  computed: {
    isStatic () {
      return this.type === ContactListTypes.STATIC
    },
    isDynamicRemote () {
      return this.type === ContactListTypes.DYNAMIC_REMOTE_LIST
    },
    isDynamic () {
      return this.type === ContactListTypes.DYNAMIC || !this.type
    }
  }
}
</script>
