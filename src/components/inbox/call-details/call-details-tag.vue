<template>
  <div class="calls-tag">{{ name }}</div>
</template>

<script>
export default {
  props: {
    name: {
      type: String,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
.calls-tag {
  font-size: 12px;
  font-family: Roboto;
  color: $black;
  background-color: $flesh;
  border-radius: 6px;
  line-height: 26px;
  padding-left: 5px;
  padding-right: 5px;
  display: inline-block;
}
</style>
