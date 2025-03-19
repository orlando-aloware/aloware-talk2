<template>
  <card class="h-100 border-0 no-border-radius contacts-sidebar-card">
    <contacts-pinned></contacts-pinned>
    <q-expansion-item
      default-opened
      expand-icon-toggle
      label="Public List"
      class="contact-sidebar-list-wrapper"
      data-testid="public-lists-sidebar-expansion-item"
    >
      <template v-slot:header>
        <q-item-section>
          <div class="pinned__header d-flex align-items-center list--header shared__header">
            <div class="header__header__title font-weight-bold flex-grow-1" data-testid="contact-public-list">
              Public Lists
              <q-icon name="info"
                      class="material-icons-outlined ml-2 cursor-pointer"
                      color="#62666E"
                      data-testid="contact-public-list-icon"
                      size="14px">
                <q-tooltip anchor="top middle"
                           data-testid="contact-public-list-tooltip"
                           self="center middle">
                  These are the contact lists shared with you by your admin
                </q-tooltip>
              </q-icon>
            </div>
          </div>
        </q-item-section>
      </template>
      <contacts-shared class="public-lists" data-testid="contacts-folders-shared-list"></contacts-shared>
    </q-expansion-item>
    <contacts-folders data-testid="contact-share-folders" />
  </card>
</template>

<script>
import Card from 'components/card.vue'
import ContactsPinned from './contacts-pinned.vue'
import ContactsFolders from './contacts-folders.vue'
import ContactsShared from './contacts-shared'
import { mapState } from 'vuex'
import { userMixin } from 'src/plugins/mixins'

export default {
  mixins: [
    userMixin
  ],
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
  computed: {
    ...mapState('cache', ['currentCompany']),

    isDemoCompany () {
      return this.isCompanyPartOfAlowareDemoCompanies(this.currentCompany?.id)
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
