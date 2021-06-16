<template>
  <b-card class="mt-2 mb-2 border-0">
    <h6>Contact Ring Groups</h6>
    <b-button class="btn-edit-action btn-bg-transparent btn-b-0 position-absolute" size="sm"
              variant="light">
      <i class="material-icons">edit</i>
    </b-button>
    <div>
      <b-badge variant="primary badge-tag badge-tag-primary">Sales #1</b-badge>
      <b-badge variant="primary badge-tag badge-tag-primary">Sales #2</b-badge>
      <b-badge variant="primary badge-tag badge-tag-primary">Aloware</b-badge>
    </div>
  </b-card>
</template>

<script>
export default {
  name: 'contact-ring-groups'
}
</script>

<style scoped>
.btn-edit-action {
  right: 10px;
  top: 10px;
}
</style>
