<template>
  <div data-testid="teaminbox-side"
       class="teaminbox-side">
    <TeamInboxNavList ref="teaminboxNavList"
                      :class="['teaminbox-side__left', {'teaminbox-side__left--mobile-hidden': $route.name !== TEAMINBOXES_MENU_TITLE}]"
                      data-testid="teaminbox-nav-list" />
    <TeamInboxTab v-if="getConnectedInboxesLength"
                  :class="['teaminbox-side__right', {'teaminbox-side__right--mobile-hidden': $route.name !== TEAMINBOXES_MENU_ITEMS_TITLE}]"
                  :collapse-target="collapseTarget"
                  data-testid="teaminbox-tab"
                  @contact-selected="onContactSelected" />

    <div v-else-if="isTeamInboxesLoaded && !hasTeamInboxes && !isMobile"
         class="teaminbox-side__empty-state">
      <img src="/images/teaminbox-request-line-instruction.png"
           alt="How to request a line and ring group from admin"
           class="empty-state-image"/>
    </div>
  </div>
</template>

<script>
import TeamInboxNavList from '../teaminbox/teaminbox-nav-list.vue'
import TeamInboxTab from '../teaminbox/teaminbox-tab.vue'
import { isEmpty } from 'lodash'
import { mapActions, mapGetters, mapState } from 'vuex'
import { TEAMINBOXES_MENU_TITLE, TEAMINBOXES_MENU_ITEMS_TITLE } from 'src/router/routes'

export default {
  name: 'TeamInboxSide',

  components: {
    TeamInboxTab,
    TeamInboxNavList
  },

  data () {
    return {
      collapseTarget: null,
      TEAMINBOXES_MENU_TITLE,
      TEAMINBOXES_MENU_ITEMS_TITLE
    }
  },

  mounted () {
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
      'isLoadingInboxes'
    ]),

    ...mapState([
      'ringGroups',
      'isMobile'
    ]),

    ...mapState('auth', [
      'profile'
    ]),

    ...mapGetters('TeamInbox', [
      'getConnectedInboxesLength',
      'isTeamInboxesLoaded',
      'hasTeamInboxes'
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
        const inbox = this.ringGroups.find(group => group.id === inboxId) || {}

        this.setActiveInbox(inbox)
      }
    },

    ringGroups: {
      immediate: true,
      handler (ringGroups) {
        if (isEmpty(this.activeInbox) && this.ringGroups.length) {
          const inbox = this.ringGroups.find(group => group.id === this.activeInboxId) || {}
          this.setActiveInbox(inbox)
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.teaminbox-side {
  background-color: #F9F9FB;
  display: flex;
  width: 100%;
  height: 100%;

  @media(min-width: 785px) {
    padding: 10px;
    column-gap: 10px;
  }

  &__left {
    width: 100vw;
    border-radius: 8px;
    overflow: hidden;

    @media(min-width: 785px) { // width defined in 'isMobile'
      max-width: 250px;
      width: 250px;
    }
  }

  &__right {
    width: 100vw;
    border-radius: 8px;

    @media(min-width: 785px) { // width defined in 'isMobile'
      max-width: 300px;
      width: 300px;
    }
  }

  @media(max-width: 784px) {
    &__left,
    &__right {
      transition: all .5s ease-in-out;

      &--mobile-hidden {
        width: 0 !important;
        overflow: hidden;
      }
    }
  }

  &__empty-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background-color: white;
    border-radius: 8px;
    margin-left: 10px;
    overflow: hidden;

    @media(max-width: 784px) {
      margin-left: 0;
      margin-top: 10px;
    }

    .empty-state-image {
      max-width: 90%;
      max-height: 70vh;
      width: auto;
      height: auto;
      object-fit: contain;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-radius: 8px;

      @media(min-width: 1400px) {
        max-width: 800px;
      }
    }
  }
}
</style>
