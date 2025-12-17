<template>
  <div :class="['avatar-circle', colorModuleClass]"
       :style="{ height: `${height}px`, width: `${width}px` }">
    {{ name | initials }}
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    height: {
      type: [Number, String],
      default: 34
    },

    width: {
      type: [Number, String],
      default: 34
    },

    name: {
      type: String,
      required: true
    },

    colorModuleId: {
      type: Number,
      required: false
    }
  },

  computed: {
    colorModuleClass () {
      if (!this.colorModuleId) {
        return ''
      }

      return `avatar-circle--color-${this.colorModuleId % 11}`
    }
  }
}
</script>

<style lang="scss">
.avatar-circle {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 13px;
  background-color: rgb(149, 152, 158);
  font-weight: 600;
  position: relative;

  &--color-0 {
    color: #E319C5;
    background-color: #FECEF7;
  }

  &--color-1 {
    color: #04A70E;
    background-color: #D7FFDA;
  }

  &--color-2 {
    color: #9031B5;
    background-color: #F4EAF7;
  }

  &--color-3 {
    color: #FF8400;
    background-color: #FFE6CC;
  }

  &--color-4 {
    color: #0126FF;
    background-color: #C9DBFF;
  }

  &--color-5 {
    color: #FFC100;
    background-color: #FFF5D3;
  }

  &--color-6 {
    color: #9F0101;
    background-color: #F7D0D0;
  }

  &--color-7 {
    color: #6A4600;
    background-color: #DCD3BC;
  }

  &--color-8 {
    color: #00B06A;
    background-color: #CFFDEB;
  }

  &--color-9 {
    color: #02C5DF;
    background-color: #CFF8FE;
  }

  &--color-10 {
    color: #FF01A6;
    background-color: #FFE5F6;
  }
}
</style>
