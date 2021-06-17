<template>
  <b-card class="mt-2 mb-2 border-0">
    <h6>Tags</h6>
    <b-button class="btn-edit-action btn-bg-transparent btn-b-0 position-absolute" size="sm"
              variant="light">
      <i class="material-icons">edit</i>
    </b-button>
    <div>
      <b-badge variant="primary contact-tag-badge custom-badge-primary"><span class="mid-dot">&#183;</span> Primary</b-badge>
      <b-badge variant="secondary contact-tag-badge custom-badge-secondary"><span class="mid-dot">&#183;</span> Secondary</b-badge>
      <b-badge variant="success contact-tag-badge custom-badge-success"><span class="mid-dot">&#183;</span> Success</b-badge>
      <b-badge variant="danger contact-tag-badge custom-badge-danger"><span class="mid-dot">&#183;</span> Danger</b-badge>
      <b-badge variant="warning contact-tag-badge custom-badge-warning"><span class="mid-dot">&#183;</span> Warning</b-badge>
      <b-badge variant="info contact-tag-badge custom-badge-info"><span class="mid-dot">&#183;</span> Info</b-badge>
      <b-badge variant="dark contact-tag-badge custom-badge-dark"><span class="mid-dot">&#183;</span> Dark</b-badge>
    </div>
  </b-card>
</template>

<script>
export default {
  name: 'contact-tags'
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
@import 'src/css/breakpoints.scss';
  .contact-tag-badge {
    background: transparent;
    font-weight: 500;
    border: 1px solid #dee2e6;
    margin-right: 5px;
  }

  .custom-badge-primary {
    color: $blue;
  }

  .custom-badge-secondary {
    color: $grey-mid;
  }

  .custom-badge-success {
    color: #28a745;
  }

  .custom-badge-danger {
    color: #dc3545;
  }

  .custom-badge-warning {
    color: #ffc107;
  }

  .custom-badge-info {
    color: #17a2b8;
  }
  .custom-badge-light {
    color: #f8f9fa;
  }
  .custom-badge-dark {
    color: #343a40;
  }

  .btn-edit-action {
    right: 10px;
    top: 10px;
  }
</style>
