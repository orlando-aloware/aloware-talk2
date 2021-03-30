<template>
  <div class="contact-count d-flex align-items-center">
    {{ count | numFormat }} Contacts
  </div>
</template>

<script>
export default {
  name: 'contact-list-count',
  props: {
    count: {
      type: Number,
      required: false,
      default: 4492
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';

.contact-count {
  color: $grey-dark;
  font-family: Roboto;
  font-size: 12px;
  letter-spacing: 0;
  line-height: 16px;
  text-align: right;
}
</style>
