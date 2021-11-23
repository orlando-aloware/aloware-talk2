<template>
  <card class="h-100 border-0 no-border-radius contacts-sidebar-card">
    <contacts-pinned></contacts-pinned>
    <q-expansion-item
      default-opened
      expand-icon-toggle
      label="Public List"
      class="contact-sidebar-list-wrapper"
    >
      <template v-slot:header>
        <q-item-section>
          <div class="pinned__header d-flex align-items-center list--header shared__header">
            <div class="header__header__title font-weight-bold flex-grow-1">
              Public Lists
              <q-icon name="info"
                      class="material-icons-outlined ml-2 cursor-pointer"
                      color="#62666E"
                      size="14px">
                <q-tooltip anchor="top middle"
                           self="center middle">
                  These are the contact list your admin shares with you.
                </q-tooltip>
              </q-icon>
            </div>
          </div>
        </q-item-section>
      </template>
      <contacts-shared></contacts-shared>
    </q-expansion-item>

    <contacts-folders v-if="toggleFolders"></contacts-folders>
  </card>
</template>

<script>
import Card from 'components/card.vue'
import ContactsPinned from './contacts-pinned.vue'
import ContactsFolders from './contacts-folders.vue'
import ContactsShared from './contacts-shared'
export default {
  components: {
    ContactsShared,
    Card,
    ContactsPinned,
    ContactsFolders
  },
  data () {
    return {
      expanded: true,
      toggleFolders: true
    }
  },
  watch: {
    '$route': {
      handler (routeObj) {
        if (routeObj.name === 'Contacts') {
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
