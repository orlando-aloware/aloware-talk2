<template>
  <div class="inbox-side">
    <div class="inbox-side__left"
         :class="{'inbox-side__left--closed': closed }">
      <calls-header :isSearch="true"/>
      <div>
        <div class="inbox-side__nav">
          <inbox-nav-list :closed="closed"></inbox-nav-list>
        </div>
      </div>
    </div>
    <div class="inbox-side__right border-left">
      <calls-header/>
      <q-btn-toggle
        class="border w-100 mx-2"
        no-caps
        dense
        unelevated
        toggle-color="primary"
        color="white"
        text-color="primary"
        :options="options"
        v-model="currentTask"
        @click="checkTask"
      />
    </div>
  </div>
</template>

<script>
import InboxNavList from 'components/inbox/inbox-nav/inbox-nav-list'
import CallsHeader from 'components/inbox/calls/calls-header'

export default {
  name: 'inbox-side',
  data () {
    return {
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
    }
  },
  mounted () {
    window.addEventListener('resize', this.toggleOnResize)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.toggleOnResize)
  },
  components: { CallsHeader, InboxNavList }
}
</script>
