<template>
  <div class="inbox-side border-top-0">
    <div class="inbox-side__left"
         :class="{'inbox-side__left--closed': closed }">
      <calls-header :isSearch="true"/>
      <div>
        <div class="inbox-side__nav">
          <inbox-nav-list :closed="closed"
                          @active="newActive">
          </inbox-nav-list>
        </div>
      </div>
    </div>
    <div class="inbox-side__right border-left">
      <calls-header class="w-100"/>
      <div class="w-100 d-flex"
        v-if="active === 'inbox'">
        <q-btn-toggle
          class="border w-100 mx-2 mt-2 mb-1"
          no-caps
          dense
          unelevated
          toggle-color="grey-9"
          color="white"
          text-color="primary"
          :options="options"
          v-model="currentTask"
          @click="checkTask">
        </q-btn-toggle>
      </div>
      <div class="w-100">
        <task-list/>
      </div>
    </div>
  </div>
</template>

<script>
import InboxNavList from 'components/inbox/inbox-nav/inbox-nav-list'
import CallsHeader from 'components/inbox/calls/calls-header'
import TaskList from 'components/icons/inbox/task-list'

export default {
  name: 'inbox-side',
  data () {
    return {
      active: 'inbox',
      closed: window.innerWidth < 992,
      currentTask: 'open',
      options: [
        {
          label: 'Open',
          value: 'open'
        },
        {
          label: 'Pending',
          value: 'pending'
        },
        {
          label: 'Closed',
          value: 'closed'
        }
      ]
    }
  },
  methods: {
    toggle () {
      this.closed = !this.closed
    },
    toggleOnResize () {
      this.closed = window.innerWidth < 992
    },
    checkTask () {
      // @TODO: work on the task states
    },
    newActive (active) {
      this.active = active
    }
  },
  mounted () {
    window.addEventListener('resize', this.toggleOnResize)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.toggleOnResize)
  },
  components: { TaskList, CallsHeader, InboxNavList }
}
</script>
