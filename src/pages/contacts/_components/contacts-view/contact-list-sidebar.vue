<template>
  <div :class="`px-0 mb-3 contact-list-sidebar-container ${widthClass}`">
    <div class="contact-list-sidebar-wrapper">
      <b-button
        variant="light"
        size="sm"
        class="sidebar-toggle"
        v-on:click="onSidebarToggle">
        <i class="material-icons">{{ is_expanded ? 'keyboard_arrow_left' : 'keyboard_arrow_right' }}</i>
      </b-button>
      <b-card no-body
              class="no-border position-relative"
              ref="scrollableArea">
        <b-list-group class="p-2">
          <b-list-group-item v-for="contact in contacts"
                             :key="contact.id"
                             :to="`/contact/${contact.id}`"
                             :class="`d-flex align-items-center border-0 ${getActiveClass(contact)}`">
            <avatar class="mr-2 contact-avatar"
                    width="40"
                    height="36"
                    :name="contact.name" />
            <div class="d-inline-flex justify-content-between full-width contact-details">
              <div class="mr-auto">
                <p class="text-bold contact-name mb-0"
                   v-b-tooltip="contact.name">{{ contact.name }}</p>
                <p class="text-sm-left contact-phone mb-1">
                  {{ contact.phone_number | fixPhone }}
                </p>
              </div>
              <p>
                <b-badge v-if="contact.unread_count > 0"
                         pill
                         class="contact-badge"
                         variant="danger">
                  {{ contact.unread_count }}
                </b-badge>
              </p>
            </div>
          </b-list-group-item>
        </b-list-group>
        <div class="relative py-4" >
          <b-overlay
            :show="true"
            spinner-variant="success"
            spinner-type="grow"
            rounded="sm"
          >
          </b-overlay>
        </div>
      </b-card>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import Avatar from 'src/components/avatar/avatar.vue'
import contactsMixins from '../../contacts.mixins'
let scrollTimeout
export default {
  name: 'sidebar',
  mixins: [contactsMixins],
  components: {
    Avatar
  },
  data () {
    return {
      is_expanded: true,
      isLoaderVisible: false
    }
  },
  computed: {
    ...mapGetters('contacts', [
      'selectedList',
      'listItems'
    ]),
    id: function () {
      return this.selectedList.id
    },
    contacts: function () {
      return this.listItems[this.selectedList.id].data
    },
    widthClass () {
      return this.is_expanded ? 'width-300' : 'width-0'
    }
  },
  methods: {
    ...mapActions('contacts', ['contactsLoaded', 'setSidebarCollapsed']),
    getActiveClass (contact) {
      return `${(this.$route.params.id === String(contact.id) ? 'active' : '')}`
    },
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
      this.is_expanded = !this.is_expanded
      this.setSidebarCollapsed(!this.is_expanded)
    }
  },
  mounted () {
    if (this.listItems[this.selectedList.id].data.length < 1) {
      this.fetch()
    }

    if (this.$refs.scrollableArea) {
      this.$refs.scrollableArea.style.height = `${this.$refs.scrollableArea.parentNode.offsetHeight}px`
      this.$refs.scrollableArea.addEventListener('scroll', this.onBottomScroll)
    }
  },
  beforeDestroy () {
    clearTimeout(scrollTimeout)
    this.$refs.scrollableArea.removeEventListener('scroll', this.onScroll)
  }
}
</script>

<style lang="scss" scoped>
  .contact-list-sidebar-wrapper {
    height: 100%;
    border-right: 1px solid #dee2e6;
    display: flex;
    justify-content: flex-end;
    position: relative;

    .sidebar-toggle {
      position: absolute;
      top: 8px;
      right: -10px;
      z-index: 1;
      border: 1px solid #EBEBEB;
      background: #FFFFFF;
      padding: 0.15rem;
      line-height: 0.5;
    }

    .card {
      max-height: calc(100vh - 80px);
      overflow: auto;
      position: relative;
      width: 300px;

      .list-group-item {
        padding: 0.75rem 0.5rem;
        margin-top: 2px;
      }

      .list-group-item.active,
      .list-group-item:hover {
        background: #F4F4F6;
        color: #040404;
        border-radius: 10px;
      }

      .contact-details {
        border-bottom: 1px solid #F4F4F6;

        .contact-name{
          font-size: 0.85em;
          display: inline-block;
          width: 190px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .contact-phone {
          font-size: 0.70em;
        }

        .contact-badge{
          margin-top: 15px;
        }
      }
    }

    .contact-avatar {
      margin-top: -8px !important;
      min-width: 40px;
    }

  }

  .contact-list-sidebar-container.width-0 {
    margin-left: 15px;
  }
</style>
