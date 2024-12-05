<template>
  <svg :width="width" :height="height" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="m15.25 3.33366v7.58334h-10.64921l-1.2675 1.2675v-8.85084zm1.0833-2.16667h-14.08334c-.59583 0-1.08333.4875-1.08333 1.08334v15.16667l4.33333-4.3333h10.83334c.5958 0 1.0833-.4875 1.0833-1.0834v-9.74997c0-.59584-.4875-1.08334-1.0833-1.08334zm5.4167 4.33334h-2.1667v9.74997h-14.08334v2.1667c0 .5958.4875 1.0833 1.08333 1.0833h11.91671l4.3333 4.3334v-16.25004c0-.59583-.4875-1.08333-1.0833-1.08333z" :fill="color" :stroke="color"/>
  </svg>
</template>

<script>
export default {
  name: 'communications-mobile-icon',
  props: {
    width: {
      type: [Number, String],
      default: 20
    },
    height: {
      type: [Number, String],
      default: 21
    },
    color: {
      type: String,
      default: '#A3A3A3'
    }
  }
}
</script>
