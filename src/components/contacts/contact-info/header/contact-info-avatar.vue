<template>
  <avatar
    :color-module-id="contact.id"
    :name="contact.name"
    class="contact-avatar"
    data-testid="contact-info-avatar"
    height="40"
    width="40"
  />
</template>

<script>
import Avatar from 'src/components/teaminbox/communication-items/avatar.vue'

export default {
  name: 'contact-info-avatar',
  components: {
    Avatar
  },
  props: {
    contact: {
      type: Object,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
.contact-avatar {
  flex-shrink: 0;

  ::v-deep & {
    margin: 0 !important;
  }
}
</style>
