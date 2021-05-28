<template>
  <div class="bulk-action-menu">
    <div class="menu-actions d-flex justify-content-around">
      <span>{{ getSelectedCount }} selected</span>
      <a href="#">
        <edit-icon class="icon"></edit-icon>
        Edit
      </a>
      <a href="" v-on:click="onDelete"><trash-icon class="icon"></trash-icon> Delete</a>
      <a href="#"><plus-icon class="icon"></plus-icon> Create List</a>
      <a href="#">Enroll in Sequence</a>
      <a href="#">Power Dialer</a>
      <a href="#">Add to Static List</a>
    </div>
  </div>
</template>

<script>
import TrashIcon from 'components/icons/trash-icon'
import EditIcon from 'components/icons/edit-icon'
import PlusIcon from 'components/icons/contacts/plus-icon'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'bulk-action-menu',
  components: { PlusIcon, EditIcon, TrashIcon },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  computed: {
    ...mapGetters('contacts', ['selectedContacts']),
    getSelectedCount () {
      return this.selectedContacts[this.id].length || 0
    }
  },
  methods: {
    ...mapActions('contacts', ['removeContactOpen']),
    onDelete (e) {
      this.$bvModal.show('remove-contact-dialog')
      e.preventDefault()
    }
  }
}
</script>

<style scoped>
  .bulk-action-menu{
    margin-left: 34px;
    margin-top: 47px;
    position: absolute;
    z-index: 9;
    background: white;
    height: 33px !important;
    padding: 7px 10px;
    width: 93% !important;
  }
  .menu-actions a{
    text-decoration: none;
  }
  .menu-actions{
    font-size: 0.75rem;
  }
  .icon{
    margin-top: -5px;
  }
</style>
