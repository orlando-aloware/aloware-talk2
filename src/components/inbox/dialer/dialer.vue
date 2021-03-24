<template>
  <div class="dialer animate__animated animate__fadeIn">
    <dialer-header></dialer-header>
    <div class="dialer__body">
      <div class="dialer__select">
        <dialer-select></dialer-select>
      </div>
      <div class="dialer__search">
        <dialer-search></dialer-search>
      </div>
      <div class="dialer__label">
        Contacts <span>3</span>
      </div>
      <div class="dialer__list">
        <dialer-item avatar="https://uifaces.co/our-content/donated/ukegoVAy.jpg" initial="AL" name="Andy Lim"
                     number="(000) 111-2222"/>
        <dialer-item avatar="https://uifaces.co/our-content/donated/ukegoVAy.jpg" initial="AL" name="Andy Lim"
                     number="(000) 111-2222"/>
        <dialer-item avatar="https://uifaces.co/our-content/donated/ukegoVAy.jpg" initial="AL" name="Andy Lim"
                     number="(000) 111-2222"/>
        <dialer-item avatar="https://uifaces.co/our-content/donated/ukegoVAy.jpg" initial="AL" name="Andy Lim"
                     number="(000) 111-2222"/>
        <dialer-item avatar="https://uifaces.co/our-content/donated/ukegoVAy.jpg" initial="AL" name="Andy Lim"
                     number="(000) 111-2222"/>
        <dialer-item avatar="https://uifaces.co/our-content/donated/ukegoVAy.jpg" initial="AL" name="Andy Lim"
                     number="(000) 111-2222"/>
      </div>
    </div>
  </div>
</template>

<script>
import DialerHeader from 'components/inbox/dialer/dialer-header'
import DialerSelect from 'components/inbox/dialer/dialer-select'
import DialerSearch from 'components/inbox/dialer/dialer-search'
import DialerItem from 'components/inbox/dialer/dialer-item'

export default {
  name: 'dialer.vue',
  components: { DialerItem, DialerSearch, DialerSelect, DialerHeader }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
@import 'src/css/breakpoints.scss';

.dialer {
  overflow-y: auto;
  &__body {
    padding: 20px;
  }

  &__select {
    padding-bottom: 40px;
  }

  &__search {
    padding-bottom: 40px;
  }

  &__label {
    font-size: 13px;
    color: $black;
    font-weight: bold;
    margin-bottom: 10px;

    span {
      display: inline-block;
      padding-left: 5px;
      color: $green;
    }
  }
}
</style>
