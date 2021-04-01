<template>
  <div class="d-none d-lg-flex align-items-center">
    <button class="message-box__attach p-0">
        <headphone-icon height="40" width="40" class="px-2" />
    </button>
    <button class="message-box__attach pr-0">
        <chevron-left height="40" width="40" class="px-2 mx-1"/>
    </button>
    <button class="message-box__attach p-0">
        <chevron-right height="40" width="40" class="px-2 mx-1" :disabled="true" />
    </button>
  </div>
</template>

<script>
import HeadphoneIcon from 'components/icons/contacts/headphone-icon'
import ChevronRight from 'components/icons/contacts/chevron-right'
import ChevronLeft from 'components/icons/contacts/chevron-left'

export default {
  name: 'contacts-header',
  components: { ChevronLeft, ChevronRight, HeadphoneIcon }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
.message-box {
  display: flex;
  align-items: center;
  border: solid 2px $grey-light7;
  @include border-radius(8 px);
  position: relative;

  &__attach {
    background-color: $white;
    border: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 100ms ease-in;
    & :hover {
      background-color: darken($white, 7%);
    }
  }
}
</style>
