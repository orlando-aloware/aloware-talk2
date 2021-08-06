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
          <b-list-group-item v-for="contact in contacts"
                             :key="contact.id"
                             :to="`/contacts/${contact.id}`"
                             class="d-flex align-items-center border-0">
            <avatar class="contact-avatar"
                    width="34"
                    height="34"
                    :name="contact.name">
            </avatar>
            <div class="ml-2 flex-grow-1 d-inline-flex justify-content-between align-items-center contact-details pt-0">
              <div class="mr-auto">
                <p class="text-bold contact-name mb-0">
                  <q-tooltip anchor="top middle"
                             self="center middle">
                    {{ contact.name }}
                  </q-tooltip>
                  {{ contact.name }}
                </p>
                <div class="text-sm-left contact-phone mb-1">
                  <span v-if="contact.phone_number !== '0'">{{ contact.phone_number | fixPhone }}</span>
                  <span v-else>Phone number unavailable</span>
                </div>
              </div>
              <div class="d-flex justify-center align-items-center">
                <b-badge v-if="(contact.unread_count + contact.unread_missed_call_count + contact.unread_voicemail_count) > 0"
                         class="contact-badge m-0 p-0 d-flex justify-center align-items-center"
                         variant="danger"
                         pill>
                  {{ contact.unread_count + contact.unread_missed_call_count + contact.unread_voicemail_count }}
                </b-badge>
              </div>
            </div>
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
import { mapActions, mapGetters } from 'vuex'
import Avatar from 'components/avatar'
import contactsMixins from 'src/plugins/mixins/contacts.mixin'

let scrollTimeout
export default {
  name: 'contact-list-sidebar',

  mixins: [contactsMixins],

  components: {
    Avatar
  },

  data () {
    return {
      isExpanded: true,
      isLoaderVisible: false
    }
  },

  computed: {
    ...mapGetters('contacts', [
      'selectedList',
      'listItems'
    ]),

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
  }
}
</script>
