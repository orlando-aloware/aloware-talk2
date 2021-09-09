<template>
  <div class="d-flex align-items-center border-0">
    <Avatar class="contact-avatar"
      width="34"
      height="34"
      name="Item" />
    <div class="ml-2 flex-grow-1 d-inline-flex justify-content-between align-items-center contact-details pt-0">
      <div class="mr-auto">
        <p class="text-bold contact-name mb-0">
          <q-tooltip
            anchor="top middle"
            self="center middle">
            Item Here
          </q-tooltip>
          1001
        <div class="text-sm-left contact-phone mb-1">
          <span>
            12121202121
          </span>
          <!-- <span v-else>Phone number unavailable</span> -->
        </div>
      </div>
      <div class="d-flex justify-center align-items-center">
        <b-badge
          class="contact-badge d-flex justify-center align-items-center"
          variant="danger"
          pill>
          101
        </b-badge>
      </div>
    </div>
  </div>
</template>

<script>

import Avatar from 'components/avatar'

export default {
  name: 'PowerDialerSidebarItem',
  props: {
    value: {
      required: true
    }
  },
  components: {
    Avatar
  }
}
</script>
