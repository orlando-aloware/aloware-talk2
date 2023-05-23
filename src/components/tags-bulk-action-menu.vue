<template>
  <div class="bulk-action-menu bulk-action-menu__tags">
    <div class="menu-actions d-flex flex-row">

      <div class="items">
        <span>{{ getSelectedCount }} selected</span>
      </div>

      <div class="items">
        <a href="#"
           disabled
           @click.prevent>
          <i class="fa fa-minus-square"></i>
          Unselect All
        </a>
      </div>

      <div class="items">
        <a href="#"
           disabled
           @click.prevent>
          <i class="fa fa-layer-group"></i>
          Assign Contacts
        </a>
      </div>

      <div class="items">
        <a href="#"
           disabled
           @click.prevent>
          <i class="fa fa-layer-group"></i>
          Add to Power Dialer
        </a>
      </div>

      <div class="items">
        <a href="#"
           disabled
           @click.prevent>
          <i class="fa fa-layer-group"></i>
          Enroll Contacts
        </a>
      </div>

      <div class="items">
        <a href="#"
           disabled
           @click.prevent>
          <i class="fa fa-trash text-danger"></i>
          Delete
        </a>
      </div>

    </div>
  </div>
</template>

<script>
import { tagsMixin } from 'src/plugins/mixins'
import { mapState } from 'vuex'

export default {
  name: 'tags-bulk-action-menu',

  mixins: [
    tagsMixin
  ],

  computed: {
    ...mapState('tagsModule', ['selectedTagIds']),

    getSelectedCount () {
      return [...this.selectedTagIds].length
    }
  }
}
</script>
