<template>
  <b-card class="mt-2 mb-2 border-0">
    <h6>Lines</h6>
    <b-button class="btn-edit-action btn-bg-transparent btn-b-0 position-absolute"
              size="sm"
              variant="light"
              id="btn-edit-contact-lines">
      <i class="material-icons">edit</i>
    </b-button>
    <div>
      <b-badge variant="primary" class="badge-tag badge-tag-primary ellipsis">Main Line Vulcan Hotels Vulcan Hotels Vulcan Hotels</b-badge>
      <b-badge variant="primary badge-tag badge-tag-primary">Vulcan Hotels</b-badge>
      <b-badge variant="primary badge-tag badge-tag-primary">Hogwarts</b-badge>
    </div>

    <update-lines-popover target="btn-edit-contact-lines"></update-lines-popover>
  </b-card>
</template>

<script>
import { mapGetters } from 'vuex'
import UpdateLinesPopover from 'pages/contacts/_components/popover/contact/update-lines-popover'

export default {
  name: 'contact-lines',
  components: { UpdateLinesPopover },
  computed: {
    ...mapGetters('contacts', ['contact']),
    lines () {
      return this.contact.lines
    }
  }
}
</script>

<style lang="scss" scoped>
.card:hover {
  .btn-edit-action{
    opacity: 1;
  }
}

.btn-edit-action {
  right: 10px;
  top: 10px;
  opacity: 0;
}
</style>
