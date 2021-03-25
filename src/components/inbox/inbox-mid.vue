<template>
  <div class="inbox-mid">
    <inbox-mid-call v-if="showMessage" @toggle="toggle" />
    <inbox-mid-msg v-if="!showMessage" @toggle="toggle" />
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
    }
  },
  mounted () {
    window.addEventListener('showMessage', this.toggle)
  },
  beforeDestroy () {
    window.removeEventListener('showMessage', this.toggle)
  },
  props: {
    contactInfoOpen: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      showMessage: false
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
  @include screen('md') {
    display: flex;
  }
}
</style>
