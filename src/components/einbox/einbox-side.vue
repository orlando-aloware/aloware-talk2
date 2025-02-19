<template>
  <div data-testid="einbox-side"
       class="einbox-side border-right">
    <div class="einbox-side__left">
        <einbox-nav-list data-testid="einbox-nav-list" />
    </div>
    <div class="einbox-side__right border-left d-flex align-items-start flex-column">
      <einbox-tab data-testid="einbox-tab"/>
    </div>
  </div>
</template>

<script>
import EinboxNavList from '../einbox/einbox-nav-list.vue'
import einboxTab from '../einbox/einbox-tab.vue'

export default {
  name: 'einbox-side',

  components: {
    einboxTab,
    EinboxNavList
  }
}
</script>

<style lang="scss" scoped>
.einbox-side {
  padding: 7px;
  background-color: #F9F9FB;
  display: flex;
  max-width: 558px;
  width: 100%;
  flex: 0 0 100%;

  &__left {
    max-width: 250px;
    width: 100%;
    overflow: hidden;
    border-radius: 12px 0px 0px 12px;
  }

  &__right {
    border-radius: 0px 12px 0px 0px;
  }
}
</style>
