<template>
  <a class="d-flex align-items-center">
    <edit-icon icon-color="green" />
    <span class="edit-text">Edit contact info</span>
  </a>
</template>

<script>
import EditIcon from 'components/icons/edit-icon.vue'
export default {
  components: {
    EditIcon
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
a:hover {
  text-decoration: none;
  cursor: pointer;
}
.edit-text {
  color: $black;
  font-size: 14px;
  display: inline-block;
  padding-left: 10px;
}
</style>
