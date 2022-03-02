<template>
  <div :class="`${widthClass}`">
    <div class="contact-list-sidebar-wrapper">
      <b-button
        variant="light"
        size="sm"
        class="sidebar-toggle"
        v-if="!$q.screen.lt.md"
        @click="onSidebarToggle">
        <i class="material-icons">{{ isExpanded ? 'keyboard_arrow_left' : 'keyboard_arrow_right' }}</i>
      </b-button>
      <b-card no-body
              class="no-border position-relative"
              @scroll="handScroll">
        <b-list-group class="p-2 pr-2">
          <b-list-group-item class="d-flex align-items-center border-0"
                             v-for="(contact, index) in contacts"
                             :key="contact.id"
                             :to="`/contacts/${contact.id}`"
                             @click="onSidebarToggleMobile">
            <contact-list-sidebar-item v-model="contacts[index]"
                                       :key="contact.id"/>
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
import _ from 'lodash'
import { mapActions, mapState } from 'vuex'
import contactsMixins from 'src/plugins/mixins/contacts.mixin'
import ContactListSidebarItem from 'components/contacts/contact-list-sidebar-item'

export default {
  name: 'contact-list-sidebar',

  mixins: [contactsMixins],

  components: {
    ContactListSidebarItem
  },

  data () {
    return {
      isExpanded: true,
      desktopIsExpanded: true,
      scrollTimeout: null
    }
  },

  computed: {
    ...mapState('contacts', ['selectedList', 'listItems', 'contact', 'isSidebarCollapsed']),
    ...mapState(['isMobile']),

    id () {
      return this.selectedList.id
    },

    contacts () {
      return _.get(this.listItems, `${this.selectedList.id}.data`, [])
    },

    widthClass () {
      const widthClass = this.isExpanded ? (this.$q.screen.lt.md ? 'contact-list-sidebar-open' : 'width-300') : 'width-0'
      return `px-0 contact-list-sidebar-container ${widthClass}${this.$q.screen.lt.md ? ' mx-0' : ''}`
    }
  },

  methods: {
    ...mapActions('contacts', ['contactsLoaded', 'setSidebarCollapsed', 'setShowContactsHeader']),
    onBottomScroll () {
      clearTimeout(this.scrollTimeout)
      // Set a timeout to run after scrolling ends
      this.scrollTimeout = setTimeout(() => {
        // Run the callback
        if (!this.isEmpty) {
          this.onLoadMore()
        }
      }, 66)
    },

    onSidebarToggle () {
      this.isExpanded = !this.isExpanded
      this.desktopIsExpanded = this.isExpanded
      this.setSidebarCollapsed(!this.isExpanded)
      if (this.isMobile) {
        this.setShowContactsHeader(this.isExpanded)
      }
    },

    onSidebarToggleMobile () {
      if (!this.isMobile) {
        return
      }

      this.isExpanded = false
      this.setShowContactsHeader(false)
      this.$emit('toggleContactActivities', false)
    },

    handScroll (el) {
      if ((el.target.offsetHeight + el.target.scrollTop) >= (el.target.scrollHeight - 70)) {
        this.onBottomScroll()
      }
    }
  },

  mounted () {
    if (this.isMobile && this.$q.screen.lt.md) {
      this.isExpanded = false
      this.setSidebarCollapsed(!this.isExpanded)
    }

    if (this.isMobile && this.$q.screen.lt.md && this.$route.name !== 'Contacts') {
      this.setShowContactsHeader(this.isExpanded)
    }

    if (_.get(this.listItems, `${this.selectedList.id}.data.length`, 0) < 1) {
      this.fetch()
    }
  },

  beforeDestroy () {
    clearTimeout(this.scrollTimeout)
  },

  watch: {
    'contact': function (value) {
      if (!_.get(this.listItems, `${this.selectedList.id}.data`, null)) {
        return
      }

      const index = this.listItems[this.selectedList.id].data.findIndex(item => item.id === value.id)

      if (index === -1) {
        return
      }

      this.listItems[this.selectedList.id].data[index] = value
    },

    '$route': {
      deep: true,
      handler: function () {
        if (this.isMobile && this.$route.name === 'Contact') {
          this.desktopIsExpanded = this.isExpanded
          this.isExpanded = false
          this.setSidebarCollapsed(!this.isExpanded)
        }

        if (this.$route.name === 'Contact' && this.$route.params.id) {
          this.fetch()
        }
      }
    },

    isMobile () {
      if (!this.isMobile) {
        this.isExpanded = this.desktopIsExpanded
      }

      if (!this.$q.screen.lt.md) {
        this.isExpanded = true
      }

      if (this.$q.screen.lt.md) {
        this.isExpanded = false
        this.$emit('toggleContactActivities', false)
      }
    },

    '$q.screen.lt.md': function () {
      if (this.$q.screen.lt.md) {
        this.isExpanded = false
        this.$emit('toggleContactActivities', false)
      }

      if (this.$q.screen.lt.md && this.$route.name === 'Contact') {
        this.setShowContactsHeader(false)
      }

      if (!this.$q.screen.lt.md) {
        this.isExpanded = true
        this.setShowContactsHeader(true)
      }
    },

    isSidebarCollapsed () {
      if (this.isSidebarCollapsed !== !this.isExpanded) {
        this.isExpanded = !this.isExpanded
      }
    }
  }
}
</script>
