<template>
  <div class="inbox-side">
    <div class="inbox-side__left"
         :class="{'inbox-side__left--closed': closed }">
      <div>
        <div class="inbox-side__nav">
          <inbox-nav-list :closed="closed"></inbox-nav-list>
        </div>
      </div>
    </div>
    <div class="border-left">
      <calls-header label="Inbound Calls"/>
      <div>
        <calls-list-section count="1" sub-label="Talk Time" label="Active"/>
        <div>
          <call-list-item avatar="https://uifaces.co/our-content/donated/3799Ffxy.jpeg" name="May Kerr"
                          number="(111) 222-3333" active />
        </div>
      </div>
      <div>
        <calls-list-section count="4" label="Queue"/>
        <div>
          <call-list-item avatar="https://randomuser.me/api/portraits/men/29.jpg" name="Mark Twain"
                          number="(205) 666-3290"/>
          <call-list-item avatar="https://uifaces.co/our-content/donated/1H_7AxP0.jpg" name="James Franco"
                          number="(205) 666-3291"/>
          <call-list-item avatar="https://uifaces.co/our-content/donated/6MWH9Xi_.jpg" name="Stephen Knowles"
                          number="(205) 666-3292"/>
          <call-list-item avatar="https://images-na.ssl-images-amazon.com/images/M/MV5BMTgxMTc1MTYzM15BMl5BanBnXkFtZTgwNzI5NjMwOTE@._V1_UY256_CR16,0,172,256_AL_.jpg" name="Shaniqua James"
                          number="(205) 666-3293"/>
        </div>
      </div>
      <calls-header label="Outbound Calls"/>
      <calls-empty-state label="No outbound calls to shown"/>
      <calls-header label="Unanswered Leads"/>
      <calls-empty-state label="No unanswered sms to shown"/>
    </div>
  </div>
</template>

<script>
import InboxNavList from 'components/inbox/inbox-nav/inbox-nav-list'
import CallsHeader from 'components/inbox/calls/calls-header'
import CallsListSection from 'components/inbox/calls/calls-list-section'
import CallListItem from 'components/inbox/calls/calls-list-item'
import CallsEmptyState from 'components/inbox/calls/calls-empty-state'

export default {
  name: 'inbox-side',
  data () {
    return {
      closed: window.innerWidth < 992
    }
  },
  methods: {
    toggle () {
      this.closed = !this.closed
    },
    toggleOnResize () {
      this.closed = window.innerWidth < 992
    }
  },
  mounted () {
    window.addEventListener('resize', this.toggleOnResize)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.toggleOnResize)
  },
  components: { CallsEmptyState, CallsListSection, CallsHeader, InboxNavList, CallListItem }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
@import 'src/css/breakpoints.scss';

.inbox-side {
  @include border-radius(10px);
  background-color: $white;
  border: solid 1px $grey-light3;
  display: flex;
  position: relative;
  overflow: hidden;
  width: 100%;
  overflow-x:auto;

  @include screen('md') {
    width: auto;
  }

  &__nav {
    padding-top: 10px;
  }

  &__left {
    min-width: 240px;
    overflow: hidden;

    &--closed {
      min-width: 40px;
    }

    @include screen('lg') {
      min-width: 240px;

      &--closed {
        min-width: 40px;
      }
    }
  }

  &__right {
    flex-grow: 1;
    border-left: solid 1px $grey-light3;
    overflow: hidden;
    height: 100%;
    overflow-y: auto;

    &--closed {
      box-shadow: none;
    }

    @include screen('lg') {
      max-width: 303px;
      box-shadow: -5px 0 24px 0 rgba(0, 0, 0, 0.08);
      &--closed {
        box-shadow: none;
      }
    }
  }
}
</style>
