<template>
  <thead class="contact-table-header">
  <tr class="contact-table-header__tr">
    <th class="contact-table-header__th contact-table-header__th--checkbox align-middle">
      <checkbox/>
    </th>
    <th class="contact-table-header__th">Name</th>
    <th class="contact-table-header__th">Phone Number</th>
    <th class="contact-table-header__th">Company</th>
    <th class="contact-table-header__th">Tags</th>
    <th class="contact-table-header__th">Unread(s)</th>
    <th class="contact-table-header__th">Action</th>
  </tr>
  </thead>
</template>

<script>
import Checkbox from 'components/checkbox/checkbox'

export default {
  name: 'contact-table-header.vue',
  components: { Checkbox }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';

.contact-table-header {
  background: $grey-light6;
  &__tr {
    height: 40px;
  }
  &__th {
    font-size: 10px;
    font-weight: bold;
    letter-spacing: 0.25px;
    text-transform: uppercase;
    color: $grey-dark;
    vertical-align: middle;
    margin: 0;
    border-top: solid 1px $grey-light3;
    border-bottom: solid 1px $grey-light3;
    text-align: left;
    &:first-child {
      width: 53px;
      padding-left: 0;
      padding-right: 0;
    }
  }
}

</style>
