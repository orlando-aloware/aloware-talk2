<template>
  <a class="inbox-nav-item" href="/" @click.prevent="onClick">
    <span>{{ label }}</span>
  </a>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    }
  },
  methods: {
    onClick() {
      this.$emit('click', this.value)
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
.inbox-nav-item {
  display: flex;
  align-items: center;
  height: 40px;
}
</style>
