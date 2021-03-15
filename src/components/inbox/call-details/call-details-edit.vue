<template>
  <a class="d-flex align-items-center">
    <edit-icon />
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
.edit-text {
  color: $black;
  font-size: 14px;
}
</style>
