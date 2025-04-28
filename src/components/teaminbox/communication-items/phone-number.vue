<template>
  <div class="phone-number">
    {{ phoneNumber | fixPhone('NATIONAL', true, false, true) }}
  </div>
</template>

<script>
export default {
  props: {
    phoneNumber: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
.phone-number {
  font-size: 12px;
  font-weight: 400;
  color: #828282;
}
</style>
