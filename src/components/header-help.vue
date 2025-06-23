<template>
  <q-item class="header-help-wrapper">
    <q-item-section class="nav-item dropdown"
                    v-if="statics.name && !statics.whitelabel && !isMobileSize">
      <q-btn-dropdown class="tab-dropdown"
                      ref="menu"
                      flat
                      :ripple="false"
                      :menu-offset="[4, 16]">
        <template v-slot:label>
                  <i class="fa fa-question-circle text-2x text-danger header-help-icon-wrapper"/>
        </template>

        <q-list class="tab-dropdown-list p-3 allow-select header-help-dropdown-list">
          <span class="text-md"
                v-if="user.profile"
                @click="noClose($event)">
                Service code: <b>{{ user.profile.company_id }}-{{ user.profile.id }}</b>
          </span>
          <br>
          <span class="text-md"
                v-if="user.profile"
                @click="noClose($event)">
            Role: <b>{{ user.profile.role_name }}</b>
          </span>
          <q-separator class="my-2" />
          <q-btn color="primary"
                 class="full-width text-caption"
                 size="sm"
                 v-close-popup
                 @click="goToConnectionTest">
            <i class="fa fa-stethoscope mr-1"></i>
            RUN CONNECTION TEST
          </q-btn>
          <q-btn color="primary"
                 v-if="shouldShowTeamInboxTutorial"
                 class="full-width text-caption mt-1"
                 size="sm"
                 v-close-popup
                 @click="watchTeamInboxTutorial">
            WATCH TUTORIAL
          </q-btn>
          <q-btn color="primary"
                 v-if="shouldShowTeamInboxEmptyVideo"
                 class="full-width text-caption mt-1"
                 size="sm"
                 v-close-popup
                 @click="watchTeamInboxEmptyVideo">
            SHOW VIDEO
          </q-btn>
          <q-btn color="primary"
                 v-if="shouldShowLinesTutorial"
                 class="full-width text-caption mt-1"
                 size="sm"
                 v-close-popup
                 @click="showLinesTutorial">
            LINES TUTORIAL
          </q-btn>
        </q-list>
      </q-btn-dropdown>
    </q-item-section>
  </q-item>
</template>

<script>
import * as Roles from 'src/constants/roles'
import { mapGetters, mapState } from 'vuex'
import VueCookies from 'vue-cookies'

export default {
  data () {
    return {
      env: null,
      branch: null,
      windowSize: null,
      Roles
    }
  },

  created () {
    // initialize window width size
    this.windowSize = window.screen.width

    // Add listener to window resize
    window.addEventListener('resize', this.windowResize)
  },

  computed: {
    ...mapGetters('auth', ['user']),
    ...mapState(['statics']),
    ...mapState('auth', ['profile']),

    ...mapGetters('TeamInbox', [
      'isTeamInboxesLoaded',
      'hasTeamInboxes'
    ]),

    isMobileSize () {
      return this.windowSize <= 425
    },

    shouldShowTeamInboxTutorial () {
      return this.$route.path.startsWith('/team-inboxes') &&
        this.isTeamInboxesLoaded &&
        this.hasTeamInboxes
    },

    shouldShowTeamInboxEmptyVideo () {
      return this.$route.path.startsWith('/team-inboxes') &&
        this.isTeamInboxesLoaded &&
        !this.hasTeamInboxes
    },

    shouldShowLinesTutorial () {
      return this.shouldShowTeamInboxTutorial
    }
  },

  methods: {
    windowResize () {
      this.windowSize = window.screen.width
    },

    noClose (event) {
      if (event) {
        event.stopPropagation()
      }
    },

    goToConnectionTest () {
      this.$router.push('/settings/connection-test')
    },

    watchTeamInboxTutorial () {
      const cookies = VueCookies
      cookies.remove(`team-inbox-${this.profile?.id}`)

      this.$store.state.TeamInbox.teamInboxTutorialComponent.openModal()
    },

    watchTeamInboxEmptyVideo () {
      const cookies = VueCookies
      cookies.remove(`team-inbox-empty-state-${this.profile?.id}`)

      this.$store.state.TeamInbox.teamInboxEmptyStateVideoComponent.openModal()
    },

    showLinesTutorial () {
      // this.$navattic.openPopup(CID_AND_LINES_DEMO)
    }
  },

  beforeDestroy () {
    window.removeEventListener('resize', this.windowResize)
  }
}
</script>

<style lang="scss" scoped>
.no-hover {
  &:hover {
    background: transparent !important;
    background-color: transparent !important;
  }

  &.q-item--clickable:hover,
  &.q-item--active:hover,
  &.q-hoverable:hover {
    background: transparent !important;
    background-color: transparent !important;
  }

  &::after {
    content: none !important;
    opacity: 0 !important;
  }
}

.custom-connection-test {
  cursor: pointer;

  &:hover, &:active, &:focus {
    background: transparent !important;
    background-color: transparent !important;
  }
}
</style>
