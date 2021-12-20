<template>
  <div>
    <a
      :class="`${isActive ? 'router-link-active router-link-exact-active' : ''}`"
      class="d-flex align-items-center item"
      @click.stop="gotoBase">
      <div class="pr-3 flex-grow-1 item-name d-flex align-items-center">
        <ListIcon />
        <span class="pl-2">{{ item.name }}</span>
      </div>
      <div class="counts d-flex align-items-center">
        <div
          class="icon d-flex align-items-center"
          @click.stop="addQueueItem">
          <AddUserIcon
            v-if="false"
            class="cursor-pointer" />
        </div>
        <b-badge class="t-badge t-badge__warning ml-2 text-white p-1">
          {{ item.count | fixCount }}
        </b-badge>
      </div>
    </a>
  </div>
</template>

<script>

import ListIcon from 'components/icons/list-icon'
import AddUserIcon from 'components/icons/add-user-icon'

export default {
  name: 'PowerDialerQueueListItem',
  props: {
    item: {
      type: Object
    }
  },
  components: {
    ListIcon,
    AddUserIcon
  },
  data () {
    return {
      isActive: true
    }
  },
  methods: {
    gotoBase () {
      if (this.$route.meta.id !== 'power-dialer-queue-filter') {
        this.$router.push('/power-dialer')
      }
    },
    addQueueItem () {
      this.$router.push('/power-dialer/list/add')
    }
  },
  watch: {
    '$route': {
      handler (val) {
        console.log('val :>> ', val.meta.id)
        this.isActive = val.meta.id === 'power-dialer-queue-filter' || val.meta.id === 'power-dialer-add-queue-list'
      },
      deep: true
    }
  }
}
</script>
