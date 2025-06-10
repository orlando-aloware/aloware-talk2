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
      <div class="empty-state-aloai-style">
        <div class="empty-state-header">
          <h3 class="title-text">Build Your Team's Command Center!</h3>
        </div>
        <div class="empty-state-image-container">
          <img src="/images/teaminbox-request-line-instruction.png"
               alt="How to request a line and ring group from admin"/>
        </div>
        <div class="empty-state-footer">
          <p class="info-text">
            Your new Team Inbox is ready to bring everyone together. This Team Inbox is designed to give you, your teammates, and your managers a single place to collaborate with full visibility.
          </p>
          <p class="info-text">
            When your administrator configures it, this empty space transforms into a powerful, multi-layered view. It works by bringing together:
          </p>
          <ul class="info-list">
            <li><strong>Connected Inboxes:</strong> See and collaborate on the real-time calls and messages being handled by every active member of this team.</li>
            <li><strong>Watching Inboxes:</strong> Give managers and supervisors a bird's-eye view of all communications for coaching, quality, and to ensure no customer is left behind.</li>
            <li><strong>Personal Inboxes:</strong> Unify the communications from everyone's direct lines into one shared, organized space so you can stop guessing and start working together.</li>
          </ul>
          <p class="info-text">
            Ready to see the full picture? Contact your administrator and ask them to set up this Team Inbox to connect your entire team today!
          </p>
        </div>
      </div>
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

    .empty-state-aloai-style {
      background: url('/assets/images/fomo/Gradient.png') no-repeat center center;
      background-size: cover;
      background-position: center;
      text-align: center;
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      padding: 20px;
      box-sizing: border-box;
      overflow: hidden;

      @media(max-height: 600px) {
        overflow-y: auto;
      }

      .empty-state-header {
        flex: 0 0 auto;
        margin-bottom: 10px;

        .title-text {
          color: #000;
          font-family: Inter;
          font-size: 22px;
          font-weight: 700;
          margin: 0;
        }
      }

      .empty-state-image-container {
        flex: 1 1 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 0;
        padding: 10px 0;

        img {
          max-width: 90%;
          max-height: 100%;
          width: auto;
          height: auto;
          object-fit: contain;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-radius: 8px;

          @media(min-width: 1400px) {
            max-width: 600px;
          }
        }
      }

      .empty-state-footer {
        flex: 0 0 auto;
        padding: 10px 20px 0;
        text-align: left;
        max-width: 800px;
        margin: 0 auto;

        .info-text {
          margin: 10px 0;
          font-size: 14px;
          line-height: 1.5;
          color: #333;

          &:last-child {
            margin-bottom: 0;
          }
        }

        .info-list {
          margin: 12px 0;
          padding-left: 20px;

          li {
            margin: 6px 0;
            font-size: 14px;
            line-height: 1.5;
            color: #333;
          }
        }
      }
    }
  }
}
</style>
