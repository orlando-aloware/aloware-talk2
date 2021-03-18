<template>
  <div class="dialer-search">
    <div class="dialer-search__icon">
      <search-icon/>
    </div>
    <div class="dialer-search__input">
      <input type="text" v-model="value" placeholder="Search" @keyup="onKeyUp">
    </div>
  </div>
</template>

<script>
import SearchIcon from 'components/icons/search-icon'

export default {
  name: 'dialer-search.vue',
  components: { SearchIcon },
  data () {
    return {
      value: null
    }
  },
  methods: {
    onKeyUp () {
      this.$emit('search', this.value)
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';

.dialer-search {
  display: flex;
  border-bottom: solid 2px $green;
  align-items: center;
  padding-bottom: 5px;

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-right: 10px;
  }

  &__input {
    flex-grow: 1;

    input {
      width: 100%;
      border: 0;
      font-size: 18px;
      caret-color: $green;
      color: $black;

      &:focus {
        outline: none;
      }
    }
  }
}
</style>
