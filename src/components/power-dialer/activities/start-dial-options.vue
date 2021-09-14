<template>
  <div class="border-left pl-2">
    <b-dropdown
      text="..."
      no-caret
      right size="sm"
      variant="white"
      class="m-0 p-0 pr-2 b-compact-dropdown-button text-bold">
      <b-dropdown-item href="#">
        <i class="fa fa-search mr-1"></i> Select Contact
      </b-dropdown-item>
      <b-dropdown-item href="#" v-b-modal:create-contact-modal>
        <i class="fa fa-plus mr-1"></i>
        Create Contact
      </b-dropdown-item>
    </b-dropdown>
  </div>
</template>

<script>
export default {
  name: 'StartDialOptions'
}
</script>
