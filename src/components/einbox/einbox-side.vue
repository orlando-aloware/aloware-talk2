<template>
  <div data-testid="einbox-side"
       class="einbox-side">
    <einbox-nav-list class="einbox-side__left"
                     data-testid="einbox-nav-list"
                     ref="eInboxNavList" />
    <einbox-tab class="einbox-side__right"
                data-testid="einbox-tab"
                :collapse-target="collapseTarget"/>
  </div>
</template>

<script>
import EinboxNavList from '../einbox/einbox-nav-list.vue'
import einboxTab from '../einbox/einbox-tab.vue'
import { isEmpty } from 'lodash'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'einbox-side',

  components: {
    einboxTab,
    EinboxNavList
  },

  data () {
    return {
      collapseTarget: null
    }
  },

  mounted () {
    this.collapseTarget = this.$refs.eInboxNavList.$el
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
  padding: 10px;
  background-color: #F9F9FB;
  display: flex;
  column-gap: 10px;

  &__left {
    max-width: 250px;
    width: 250px;
    overflow: hidden;
    border-radius: 8px;
  }

  &__right {
    max-width: 300px;
    width: 300px;
    border-radius: 8px;
  }
}
</style>
