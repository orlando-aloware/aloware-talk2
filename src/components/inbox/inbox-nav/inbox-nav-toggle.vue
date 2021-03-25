<template>
  <div class="inbox-nav-toggle"
       :class="{'inbox-nav-toggle--closed': closed, 'inbox-nav-toggle--opened': !closed}" @click="onClick">
    <show-content v-if="closed"/>
    <hide-minimize v-if="!closed"/>
    <div class="flex-grow-1"></div>
  </div>
</template>

<script>
import ShowContent from 'components/icons/show-content-icon.vue'
import HideMinimize from 'components/icons/hide-minimize-icon.vue'

export default {
  name: 'inbox-nav-toggle.vue',
  props: {
    closed: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    onClick () {
      this.$emit('toggle', !this.closed)
    }
  },
  components: {
    ShowContent,
    HideMinimize
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
@import 'src/css/breakpoints.scss';

.inbox-nav-toggle {
  height: 45px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: solid 1px $grey-light3;
  cursor: pointer;
  padding-left: 10px;

  &--closed {
    width: 40px;
  }

  &--opened {
    width: 100%;
  }

  @include screen('lg') {
    justify-content: start;
    width: 100%;
  }
}
</style>
