<template>
  <div :class="`px-0 mb-3 contact-list-sidebar-container ${widthClass}`">
    <div class="contact-list-sidebar-wrapper">
      <b-button
        variant="light"
        size="sm"
        class="sidebar-toggle"
        v-on:click="onSidebarToggle">
        <i class="material-icons">{{ isExpanded ? 'keyboard_arrow_left' : 'keyboard_arrow_right' }}</i>
      </b-button>
      <b-card no-body
              class="no-border position-relative"
              ref="scrollableArea">
        <b-list-group class="p-2 pr-3">
          <b-list-group-item v-for="contact in contacts"
                             :key="contact.id"
                             :to="`/contact/${contact.id}`"
                             :class="`d-flex align-items-center border-0 ${getActiveClass(contact)}`">
            <avatar class="contact-avatar"
                    width="34"
                    height="34"
                    :name="contact.name" />
            <div class="ml-2 flex-grow-1 d-inline-flex justify-content-between contact-details">
              <div class="mr-auto">
                <p class="text-bold contact-name mb-0"
                   v-b-tooltip="contact.name">{{ contact.name }}</p>
                <p class="text-sm-left contact-phone mb-1">
                  <span v-if="contact.phone_number !== '0'">{{ contact.phone_number | fixPhone }}</span>
                  <span v-else>Phone number unavailable</span>
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
            :show="isLoadingMore"
            rounded="sm"
          >
            <template #overlay>
              <q-spinner-bars color="primary" />
            </template>
          </b-overlay>
        </div>
      </b-card>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import Avatar from 'components/avatar.vue'
import contactsMixins from 'src/plugins/mixins/contacts.mixin'
let scrollTimeout
export default {
  name: 'sidebar',
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
    id: function () {
      return this.selectedList.id
    },
    contacts: function () {
      return this.listItems[this.selectedList.id].data
    },
    widthClass () {
      return this.isExpanded ? 'width-300' : 'width-0'
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
      this.isExpanded = !this.isExpanded
      this.setSidebarCollapsed(!this.isExpanded)
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
@import "src/css/variables.scss";
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
      border: 1px solid $grey-60;
      background: $white;
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
        background: $grey-50;
        color: $grey-100;
        border-radius: 10px;
      }

      .contact-details {
        border-bottom: 1px solid $grey-50;

        .contact-name{
          font-size: $f-size-13;
          color: $grey-100;
          font-weight: 500;
          display: inline-block;
          width: 190px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .contact-phone {
          font-size: 13px;
          font-weight: 400;
          color: $grey-80;
          margin-top: -10px;
        }

        .contact-badge{
          margin-top: 15px;
        }
      }
    }

    .contact-avatar {
      margin-top: 0 !important;
      background-color: $grey-80 !important;
      color: $white !important;
      font-weight: 600;
    }

  }

  .contact-list-sidebar-container.width-0 {
    margin-left: 15px;
  }
</style>
