<template>
  <div class="bulk-action-menu">
    <div class="menu-actions d-flex justify-content-around">
      <span>{{ getSelectedCount }} selected</span>
      <a href="#">
        <i class="fa fa-pen"></i>
        Edit
      </a>
      <a href="" v-on:click="onDelete">
        <i class="fa fa-trash"></i>
        Delete
      </a>
      <a href="#"><i class="fa fa-plus"></i> Create List</a>
      <a href="#">
        <i class="fa fa-layer-group"></i>
        Enroll in Sequence</a>
      <a href="#">
        <i class="fa fa-crosshairs"></i>
        Power Dialer</a>
      <a href="#">
        <i class="fa fa-user-plus"></i>
        Add to Static List
      </a>
    </div>
  </div>
</template>

<script>

import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'bulk-action-menu',
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
    ...mapActions('contacts', ['removeContactOpen', 'setBulkDelete']),
    onDelete (e) {
      this.setBulkDelete(true)
      this.$bvModal.show('remove-contact-dialog')
      e.preventDefault()
    }
  }
}
</script>

<style scoped lang="scss">
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
    font-weight: 500;
    .fa {
      color: #6F6F6F;
    }
    svg{
      margin-top: -5px;
    }
  }
  .menu-actions{
    font-size: 0.75rem;
  }
</style>
