<template>
  <div class="inbox-mid" :class="{'inbox-mid--show': showingMid}">
    <inbox-mid-call v-if="showMessage" @toggle="toggle"/>
    <inbox-mid-msg v-if="!showMessage" @toggle="toggle"/>
  </div>
</template>

<script>
import InboxMidCall from './inbox-mid-call'
import InboxMidMsg from './inbox-mid-msg'

export default {
  name: 'inbox-mid.vue',
  components: { InboxMidMsg, InboxMidCall },
  methods: {
    toggle () {
      this.showMessage = !this.showMessage
      console.log(this.showMessage)
    },
    showMid () {
      this.showingMid = true
    }
  },
  mounted () {
    this.$VueEvent.listen('show_message', this.toggle)
    this.$VueEvent.listen('make_call', this.showMid)
  },
  props: {
    contactInfoOpen: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      showMessage: false,
      showingMid: false
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
@import 'src/css/breakpoints.scss';

.inbox-mid {
  @include border-radius(10px);
  background-color: $white;
  border: solid 1px $grey-light3;
  display: none;
  position: relative;
  overflow: hidden;
  flex-grow: 1;

  &--show {
    @include screen-max('sm') {
      position: absolute;
      display: flex;
      z-index: 1000;
      width: 100%;
      height: 100%;
    }
  }

  @include screen('md') {
    display: flex;
  }
}
</style>
