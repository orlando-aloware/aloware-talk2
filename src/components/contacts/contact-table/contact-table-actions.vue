<template>
  <div class="w-100">
    <div class="d-flex mr-auto">
      <icon-button>
        <template slot="icon">
          <phone-icon iconColor="white" width="16px" height="16px" />
        </template>
        <template slot="text">Add Contact</template>
      </icon-button>
      <contact-list-search class="mx-3"/>
      <contact-list-count class="ml-auto" />
    </div>

  </div>
</template>

<script>
import IconButton from '../../icon-button/icon-button'
import PhoneIcon from 'components/icons/phone-icon.vue'
import ContactListSearch from 'components/contacts/contact-list/contact-list-search'
import ContactListCount from 'components/contacts/contact-list/contact-list-count'
export default {
  name: 'contact-table-actions',
  components: {
    ContactListCount,
    ContactListSearch,
    IconButton,
    PhoneIcon
  }
}
</script>

<style lang="scss" scoped>

</style>
