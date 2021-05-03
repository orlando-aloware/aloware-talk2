<template>
  <div class="contact-list-search"
       :style="{'width': width + 'px', 'height': height + 'px'}">
    <div class="contact-list-search__icon">
      <small-search-icon width="24"
                   height="24"
                   iconColor="grey-light10"/>
    </div>
    <div class="contact-list-search__input">
      <input type="text"
             v-model="value"
             placeholder="Search..."
             @keyup="onKeyUp">
    </div>
  </div>
</template>

<script>
import SmallSearchIcon from 'components/icons/small-search-icon'

export default {
  name: 'contact-list-search',
  components: { SmallSearchIcon },
  props: {
    width: {
      type: Number,
      required: false,
      default: 160
    },
    height: {
      type: Number,
      required: false,
      default: 30
    }
  },
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

.contact-list-search {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  border: 1px solid $grey-light3;
  border-radius: 15px;

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__input {
    display: flex;
    align-items: center;
    input {
      width: 100%;
      border: 0;
      font-size: 12px;
      font-family: Roboto;
      caret-color: $grey;
      color: $black;

      &:focus {
        outline: none;
      }
    }
  }
}
</style>
