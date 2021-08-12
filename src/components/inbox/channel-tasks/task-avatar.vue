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
