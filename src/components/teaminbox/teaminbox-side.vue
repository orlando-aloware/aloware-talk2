<template>
  <div data-testid="teaminbox-side"
       class="teaminbox-side">
    <TeamInboxNavList ref="teaminboxNavList"
                      :class="['teaminbox-side__left', {'teaminbox-side__left--mobile-hidden': $route.name !== TEAMINBOXES_MENU_TITLE, 'no-max-width-collapse-button': isNavListCollapsed }]"
                      data-testid="teaminbox-nav-list" />
    <TeamInboxTab v-if="getConnectedInboxesLength"
                  :class="['teaminbox-side__right', {'teaminbox-side__right--mobile-hidden': $route.name !== TEAMINBOXES_MENU_ITEMS_TITLE}]"
                  :collapse-target="collapseTarget"
                  data-testid="teaminbox-tab"
                  @contact-selected="onContactSelected" />

    <div v-else-if="isTeamInboxesLoaded && !hasAnyInboxes && !isMobile"
         class="teaminbox-side__empty-state">
      <team-inbox-empty-state />
    </div>

    <div v-if="isLoadingInboxes && isNavListCollapsed">
      <div class="teaminbox-tab teaminbox-side__right">
        <div class="text-center" style="margin-top: 160px">
          <q-spinner-bars color="primary"
                          size="2em" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TeamInboxNavList from '../teaminbox/teaminbox-nav-list.vue'
import TeamInboxTab from '../teaminbox/teaminbox-tab.vue'
import TeamInboxEmptyState from '../teaminbox/teaminbox-empty-state.vue'
import { isEmpty } from 'lodash'
import { mapActions, mapGetters, mapState } from 'vuex'
import { TEAMINBOXES_MENU_ITEMS_TITLE, TEAMINBOXES_MENU_TITLE } from 'src/router/routes'
import { mapFields } from 'vuex-map-fields'

export default {
  name: 'TeamInboxSide',

  components: {
    TeamInboxTab,
    TeamInboxNavList,
    TeamInboxEmptyState
  },

  data () {
    return {
      isNavListCollapsed: false,
      collapseTarget: null,
      TEAMINBOXES_MENU_TITLE,
      TEAMINBOXES_MENU_ITEMS_TITLE
    }
  },

  mounted () {
    if (!this.isMobile) {
      this.isNavListCollapsed = this.isTeamInboxNavListCollapsed ?? (window.innerWidth < 1367)
    }

    // Allow DOM to fully render before accessing refs
    this.$nextTick(() => {
      if (this.$refs.teaminboxNavList) {
        this.collapseTarget = this.$refs.teaminboxNavList.$el
      }
    })
  },

  computed: {
    ...mapState('TeamInbox', [
      'activeInboxId',
      'activeInbox',
      'inboxes',
      'isLoadingInboxes',
      'hasAnyInboxes'
    ]),

    ...mapState([
      'isMobile'
    ]),

    ...mapState('auth', [
      'profile'
    ]),

    ...mapGetters('TeamInbox', [
      'getConnectedInboxesLength',
      'isTeamInboxesLoaded',
      'hasTeamInboxes'
    ]),

    ...mapFields('settings', [
      'isTeamInboxNavListCollapsed'
    ])
  },

  methods: {
    ...mapActions('TeamInbox', [
      'setActiveInbox'
    ]),

    onContactSelected (data) {
      // Propagate the contact-selected event to the parent component
      this.$emit('contact-selected', data)
    }
  },

  watch: {
    activeInboxId: {
      immediate: true,
      handler (inboxId) {
        const inbox = this.inboxes.find(item => item.id === inboxId) || {}

        this.setActiveInbox(inbox)
      }
    },

    inboxes: {
      immediate: true,
      handler (inboxes) {
        if (isEmpty(this.activeInbox) && inboxes.length) {
          const inbox = inboxes.find(item => item.id === this.activeInboxId) || {}
          this.setActiveInbox(inbox)
        }
      }
    },

    isTeamInboxNavListCollapsed (value) {
      this.isNavListCollapsed = value
    }
  }
}
</script>

<style lang="scss" scoped>
.teaminbox-side {
  background-color: #F9F9FB;
  display: flex;

  @media(min-width: 785px) {
    padding: 10px;
    column-gap: 10px;
  }

  &__left {
    width: 100vw;
    border-radius: 8px;
    overflow: hidden;

    @media(min-width: 785px) { // width defined in 'isMobile'
      max-width: 240px;
      width: 240px;
    }

    @media(min-width: 1367px) {
      max-width: 250px;
      width: 250px;
    }
  }

  &__right {
    width: 100vw;
    border-radius: 8px;

    @media(min-width: 785px) { // width defined in 'isMobile'
      max-width: 275px;
      width: 275px;
    }

    @media(min-width: 1367px) {
      max-width: 300px;
      width: 300px;
    }
  }

  @media(max-width: 784px) {
    &__left,
    &__right {
      &--mobile-hidden {
        width: 0 !important;
        overflow: hidden;
      }
    }
  }

  &__empty-state {
    flex: 1;
    background-color: white;
    border-radius: 8px;
    margin-left: 10px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    @media(max-width: 784px) {
      margin-left: 0;
      margin-top: 10px;
    }
  }
}
</style>
