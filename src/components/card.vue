<template>
  <div class="mycard d-flex flex-column" v-bind:class="{ 'mycard--shadow': shadow }">
    <slot />
  </div>
</template>

<script>
export default {
  props: {
    shadow: {
      type: Boolean,
      default: false
    }
  }
}
</script>
