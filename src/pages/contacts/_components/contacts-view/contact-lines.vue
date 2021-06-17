<template>
  <b-card class="mt-2 mb-2 border-0">
    <h6>Lines</h6>
    <b-button class="btn-edit-action btn-bg-transparent btn-b-0 position-absolute" size="sm"
              variant="light">
      <i class="material-icons">edit</i>
    </b-button>
    <div>
      <b-badge variant="primary badge-tag badge-tag-primary">Main Line</b-badge>
      <b-badge variant="primary badge-tag badge-tag-primary">Vulcan Hotels</b-badge>
      <b-badge variant="primary badge-tag badge-tag-primary">Hogwarts</b-badge>
    </div>
  </b-card>
</template>

<script>
export default {
  name: 'contact-lines'
}
</script>

<style lang="scss" scoped>
.btn-edit-action {
  right: 10px;
  top: 10px;
}
</style>
