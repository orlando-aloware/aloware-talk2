<template>
  <div :class="`${widthClass}`">
    <div class="contact-list-sidebar-wrapper">
      <b-button class="sidebar-toggle"
                variant="light"
                size="sm"
                v-if="!$q.screen.lt.md"
                @click="onSidebarToggle">
        <i class="material-icons">{{ isExpanded ? 'keyboard_arrow_left' : 'keyboard_arrow_right' }}</i>
      </b-button>
      <b-card class="no-border position-relative h-100"
              no-body
              @scroll="handScroll">
        <b-list-group class="p-2 pr-2">
            <contact-list-sidebar-item :class="[isSelected(item) ? 'router-link-exact-active router-link-active' : '']"
                                       :key="item.id"
                                       v-for="(item, index) in fixedContactsData.data"
                                       v-model="fixedContactsData.data[index]"
                                       @itemSelected="onSidebarToggleMobile(item)"/>
        </b-list-group>
        <div class="relative py-4">
          <b-overlay rounded="sm"
                     :show="isLoadingMore">
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
import ContactListSidebarItem from 'components/contacts/contact-list-sidebar-item'

export default {
  name: 'contact-list-sidebar',

  inject: ['contactsData'],

  components: {
    ContactListSidebarItem
  },

  props: {
    isLoadingMore: {
      type: Boolean,
      default: false
    }
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

    widthClass () {
      const widthClass = this.isExpanded ? (this.$q.screen.lt.md ? 'contact-list-sidebar-open' : 'width-300') : 'width-0'

      return `px-0 contact-list-sidebar-container ${widthClass}${this.$q.screen.lt.md ? ' mx-0' : ''}`
    },

    fixedContactsData () {
      if (!_.isEqual(this.$parent.$data.contactsData, this.contactsData)) {
        return this.$parent.$data.contactsData
      }

      return this.contactsData
    },

    contactIdOnUrl () {
      return this.$route.params.id ? parseInt(this.$route.params.id) : null
    }
  },

  methods: {
    ...mapActions('contacts', ['setSidebarCollapsed', 'setShowContactsHeader']),

    onBottomScroll () {
      clearTimeout(this.scrollTimeout)
      // Set a timeout to run after scrolling ends
      this.scrollTimeout = setTimeout(() => {
        // Run the callback
        if (!this.isEmpty) {
          this.$VueEvent.fire('onLoadMoreContacts')
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

    onSidebarToggleMobile (contact) {
      this.$emit('contactSelected', contact)

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
    },

    isSelected (item) {
      if (this.contact.id !== this.contactIdOnUrl) {
        return this.contactIdOnUrl === item.id
      }

      return this.contact.id === item.id
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

    if (this.fixedContactsData.length === 0) {
      this.$VueEvent.fire('fetchContacts')
    }

    this.$VueEvent.fire('contactsListSidebarDataLoaded', this.fixedContactsData.data)
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
