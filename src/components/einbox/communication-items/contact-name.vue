<template>
  <div class="contact-name"
       :id="`contact-name-${_uid}`">
    <div class="ellipse">
      {{ name }}
    </div>

    <b-popover triggers="hover"
               custom-class="talk-table__popover"
               placement="bottom"
               :target="`contact-name-${_uid}`">
      {{ name }}
    </b-popover>
  </div>
</template>

<script>
export default {
  props: {
    name: {
      type: String,
      required: false,
      default: 'No Name'
    }
  }
}
</script>

<style>
.contact-name {
  font-size: 14px;
  font-weight: 500;
  width: 195px;
}
</style>
