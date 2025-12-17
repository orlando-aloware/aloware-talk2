<template>
  <div class="contact-name"
       :id="`contact-name-${_uid}`">
    <div class="contact-name ellipse">
      {{ name }}
      <span class="contact-name__repeat-counter">
        {{ repeats ? `(${repeats + 1})` : '' }}
      </span>
    </div>

    <b-popover triggers="hover"
               custom-class="talk-table__popover"
               placement="bottom"
               :target="`contact-name-${_uid}`"
               v-if="name.length >= 27">
      {{ name }}
    </b-popover>
  </div>
</template>

<script>
export default {
  props: {
    name: {
      type: String,
      required: true
    },

    repeats: {
      type: Number,
      required: false
    }
  }
}
</script>

<style scoped lang="scss">
.contact-name {
  font-size: 14px;
  font-weight: 500;

  &__repeat-counter {
    color: #256eff;
  }
}
</style>
