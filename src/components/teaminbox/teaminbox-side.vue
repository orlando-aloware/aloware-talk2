<template>
  <div data-testid="teaminbox-side"
       class="teaminbox-side">
    <teaminbox-nav-list data-testid="teaminbox-nav-list"
                     :class="['teaminbox-side__left', {'teaminbox-side__left--mobile-hidden': $route.name !== TEAMINBOXES_MENU_TITLE}]"
                     ref="TeaminboxNavList" />
    <teaminbox-tab data-testid="teaminbox-tab"
                :class="['teaminbox-side__right', {'teaminbox-side__right--mobile-hidden': $route.name !== TEAMINBOXES_MENU_ITEMS_TITLE}]"
                :collapse-target="collapseTarget" />
  </div>
</template>

<script>
import TeamInboxNavList from '../teaminbox/teaminbox-nav-list.vue'
import TeamInboxTab from '../teaminbox/teaminbox-tab.vue'
import { isEmpty } from 'lodash'
import { mapActions, mapState } from 'vuex'
import { TEAMINBOXES_MENU_TITLE, TEAMINBOXES_MENU_ITEMS_TITLE } from 'src/router/routes'

export default {
  name: 'teaminbox-side',

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
    if (this.$refs.teaminboxNavList) {
      this.collapseTarget = this.$refs.teaminboxNavList.$el
    }
  },

  computed: {
    ...mapState('TeamInbox', [
      'activeInboxId',
      'activeInbox'
    ]),

    ...mapState([
      'ringGroups'
    ])
  },

  methods: {
    ...mapActions('TeamInbox', [
      'setActiveInbox'
    ])
  },

  watch: {
    activeInboxId: {
      immediate: true,
      handler (inboxId) {
        // FIXME: for now, get it from ring groups
        const inbox = this.ringGroups.find(group => group.id === inboxId) || {}

        this.setActiveInbox(inbox)
      }
    },

    ringGroups: {
      immediate: true,
      handler () {
        if (isEmpty(this.activeInbox) && this.ringGroups.length) {
          // FIXME: for now, get it from ring groups
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
}
</style>
