<template>
  <div class="inbox-nav-toggle" @click="onClick">
    <show-content v-if="isOpen"/>
    <hide-minimize v-if="!isOpen"/>
  </div>
</template>

<script>
import ShowContent from 'components/icons/show-content-icon.vue'
import HideMinimize from 'components/icons/hide-minimize-icon.vue'

export default {
  name: 'inbox-nav-toggle.vue',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    onClick () {
      this.$emit('toggle', !this.isOpen)
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

.inbox-nav-toggle {
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  border-bottom: solid 1px $grey-light3;
  cursor: pointer;
}
</style>
