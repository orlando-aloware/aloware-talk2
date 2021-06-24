<template>
  <b-card class="mt-2 mb-2 border-0">
    <h6>Tags</h6>
    <div>
      <b-badge v-for="tag in tags"
               variant="primary"
               class="badge-tag custom-badge-primary ellipsis"
               v-b-tooltip="tag.name"
               :key="tag.id" >
        <i class="fa fa-circle" :style="`color: ${tag.color};font-size:100%;`"></i> {{ tag.name }}
      </b-badge>
    </div>

    <b-link href="#" class="custom-link text-decoration-none" id="btn-add-tag">
      <i class="material-icons">add</i> Add tag
    </b-link>

    <add-tag-popover target="btn-add-tag" triggers="click"></add-tag-popover>
  </b-card>
</template>

<script>
import { mapGetters } from 'vuex'
import AddTagPopover from 'pages/contacts/_components/popover/contact/add-tag-popover'

export default {
  name: 'contact-tags',
  components: { AddTagPopover },
  computed: {
    ...mapGetters('contacts', ['contact']),
    tags () {
      return this.contact.tags
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
@import 'src/css/breakpoints.scss';
  .badge-tag {
    background: transparent;
    font-weight: 500;
    border: 1px solid #dee2e6;
    margin-right: 5px;
    font-size: 0.80em;
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

  .tags-form-popover {
    left: -280px !important;
  }

  .q-tags-menu {
    width: 300px !important;
  }
</style>
