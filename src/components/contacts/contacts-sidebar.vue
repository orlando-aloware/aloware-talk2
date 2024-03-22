<template>
  <card class="h-100 border-0 no-border-radius contacts-sidebar-card">
    <contacts-pinned></contacts-pinned>
    <q-expansion-item
      default-opened
      expand-icon-toggle
      label="Public List"
      class="contact-sidebar-list-wrapper"
      data-testid="contact-public-list-expansion-item"
    >
      <template v-slot:header>
        <q-item-section>
          <div class="pinned__header d-flex align-items-center list--header shared__header">
            <div class="header__header__title font-weight-bold flex-grow-1" data-testid="contact-public-list">
              Public Lists
              <q-icon name="info"
                      class="material-icons-outlined ml-2 cursor-pointer"
                      color="#62666E"
                      data-testid="contact-public-list-tooltip"
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
      <contacts-shared class="public-lists" data-testid="contact-share-list"></contacts-shared>
    </q-expansion-item>

    <contacts-folders data-testid="contact-share-folders"></contacts-folders>
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
        this.toggleFolders = routeObj.name === 'Contacts'
      },
      deep: true
    }
  }
}
</script>
