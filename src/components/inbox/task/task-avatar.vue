<template>
  <div class="task-avatar" :class="{'animated-wrapper-2': animated}">
    <div class="task-avatar__inner" :class="{'animated-wrapper': animated}">
      <div class="task-avatar__main" :class="{'task-avatar__main--image': !!src}"
           :style="`background-image:url(${src});`">
        <slot/>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'task-avatar',
  props: {
    src: {
      type: String,
      default: null
    },
    animated: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
@import 'src/css/breakpoints.scss';

.animated-wrapper {
  animation-timing-function: ease-in-out;
  animation: wrapper-animate 1s infinite;
}

.animated-wrapper-2 {
  animation-timing-function: ease-in-out;
  animation: wrapper-animate 1.05s infinite;
}

.task-avatar {
  width: 178px;
  height: 178px;
  display: flex;
  align-items: center;
  justify-content: center;
  @include border-radius(50%);

  @include screen('md') {
    width: 190px;
    height: 190px;
  }

  @include screen('md') {
    width: 200px;
    height: 200px;
  }

  &__inner {
    width: 75%;
    height: 75%;
    display: flex;
    align-items: center;
    justify-content: center;
    @include border-radius(50%);
  }

  &__main {
    width: 70%;
    height: 70%;
    background-color: $green;
    @include border-radius(50%);
    display: flex;
    align-items: center;
    justify-content: center;
    letter-spacing: 1.15px;
    line-height: 60px;
    font-size: 46px;
    color: $white;
    font-weight: 500;

    &--image {
      color: transparent;
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center;
    }
  }

  @keyframes wrapper-animate {
    0%   {background-color: transparentize($green, .82);}
    25%  {background-color: transparentize($green, .87);}
    50%  {background-color: transparentize($green, .93);}
    100% {background-color: transparentize($green, 1);}
  }
}
</style>
