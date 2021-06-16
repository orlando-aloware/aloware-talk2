<template>
  <b-card class="mt-2 mb-2 border-0">
    <h6>Broadcast</h6>
    <b-button class="btn-edit-action btn-bg-transparent btn-b-0 position-absolute" size="sm"
              variant="light">
      <i class="material-icons">edit</i>
    </b-button>
    <div>
      <b-badge variant="primary badge-tag badge-tag-primary">Test Broadcast</b-badge>
    </div>
  </b-card>
</template>

<script>
export default {
  name: 'contact-broadcast'
}
</script>

<style scoped>
.btn-edit-action {
  right: 10px;
  top: 10px;
}
</style>
