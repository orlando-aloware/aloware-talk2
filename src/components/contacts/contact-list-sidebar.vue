<template>
  <div :class="`px-0 contact-list-sidebar-container ${widthClass}`">
    <div class="contact-list-sidebar-wrapper">
      <b-button
        variant="light"
        size="sm"
        class="sidebar-toggle"
        @click="onSidebarToggle">
        <i class="material-icons">{{ isExpanded ? 'keyboard_arrow_left' : 'keyboard_arrow_right' }}</i>
      </b-button>
      <b-card no-body
              class="no-border position-relative"
              @scroll="handScroll">
        <b-list-group class="p-2 pr-3">
          <b-list-group-item v-for="(contact, index) in contacts"
                             :key="contact.id"
                             :to="`/contacts/${contact.id}`"
                             class="d-flex align-items-center border-0">
            <contact-list-sidebar-item v-model="contacts[index]" :key="contact.id"></contact-list-sidebar-item>
          </b-list-group-item>
        </b-list-group>
        <div class="relative py-4">
          <b-overlay :show="isLoadingMore"
                     rounded="sm">
            <template #overlay>
              <q-spinner-bars color="primary"/>
            </template>
          </b-overlay>
        </div>
      </b-card>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import contactsMixins from 'src/plugins/mixins/contacts.mixin'
import ContactListSidebarItem from 'components/contacts/contact-list-sidebar-item'

let scrollTimeout
export default {
  name: 'contact-list-sidebar',

  mixins: [contactsMixins],

  components: {
    ContactListSidebarItem
  },

  data () {
    return {
      isExpanded: true,
      isLoaderVisible: false
    }
  },

  computed: {
    ...mapState('contacts', ['selectedList', 'listItems', 'contact']),

    id () {
      return this.selectedList.id
    },

    contacts () {
      return this.listItems[this.selectedList.id].data
    },

    widthClass () {
      return this.isExpanded ? 'width-300' : 'width-0'
    }
  },

  methods: {
    ...mapActions('contacts', ['contactsLoaded', 'setSidebarCollapsed']),
    onBottomScroll () {
      clearTimeout(scrollTimeout)
      // Set a timeout to run after scrolling ends
      scrollTimeout = setTimeout(() => {
        // Run the callback
        if (!this.isEmpty) {
          this.onLoadMore()
        }
      }, 66)
    },

    onSidebarToggle () {
      this.isExpanded = !this.isExpanded
      this.setSidebarCollapsed(!this.isExpanded)
    },

    handScroll (el) {
      if ((el.target.offsetHeight + el.target.scrollTop) >= (el.target.scrollHeight - 70)) {
        this.onBottomScroll()
      }
    }
  },

  mounted () {
    if (this.listItems[this.selectedList.id].data.length < 1) {
      this.fetch()
    }
  },

  beforeDestroy () {
    clearTimeout(scrollTimeout)
  },

  watch: {
    'contact': function (value) {
      let index = this.listItems[this.selectedList.id].data.findIndex(item => item.id === value.id)
      if (index) {
        this.listItems[this.selectedList.id].data[index] = value
      }
    }
  }
}
</script>
