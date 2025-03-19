<template>
  <div data-testid="einbox-side"
       class="einbox-side">
    <einbox-nav-list data-testid="einbox-nav-list"
                     :class="['einbox-side__left', {'einbox-side__left--mobile-hidden': $route.name !== EINBOXES_MENU_TITLE}]"
                     ref="eInboxNavList" />
    <einbox-tab data-testid="einbox-tab"
                :class="['einbox-side__right', {'einbox-side__right--mobile-hidden': $route.name !== EINBOXES_MENU_ITEMS_TITLE}]"
                :collapse-target="collapseTarget" />
  </div>
</template>

<script>
import EinboxNavList from '../einbox/einbox-nav-list.vue'
import einboxTab from '../einbox/einbox-tab.vue'
import { isEmpty } from 'lodash'
import { mapActions, mapState } from 'vuex'
import { EINBOXES_MENU_TITLE, EINBOXES_MENU_ITEMS_TITLE } from 'src/router/routes'

export default {
  name: 'einbox-side',

  components: {
    einboxTab,
    EinboxNavList
  },

  data () {
    return {
      collapseTarget: null,
      EINBOXES_MENU_TITLE,
      EINBOXES_MENU_ITEMS_TITLE
    }
  },

  mounted () {
    if (this.$refs.eInboxNavList) {
      this.collapseTarget = this.$refs.eInboxNavList.$el
    }
  },

  computed: {
    ...mapState('Einbox', [
      'activeInboxId',
      'activeInbox'
    ]),

    ...mapState([
      'ringGroups'
    ])
  },

  methods: {
    ...mapActions('Einbox', [
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
.einbox-side {
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
