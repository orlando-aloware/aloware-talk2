<template>
  <svg :width="width" :height="height" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 1.78174H12C13.6569 1.78174 15 3.12489 15 4.78174V10.9999C15 12.6568 13.6569 13.9999 12 13.9999H4C2.34315 13.9999 1 12.6568 1 10.9999V4.78174C1 3.12488 2.34315 1.78174 4 1.78174Z" :stroke="color" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M1 4.45459H15V5.67641H1V4.45459Z" :fill="color"/>
    <path d="M4.5 0.65625C4.5 0.293813 4.79381 0 5.15625 0C5.51869 0 5.8125 0.293813 5.8125 0.65625V1.12557C5.8125 1.48801 5.51869 1.78182 5.15625 1.78182C4.79381 1.78182 4.5 1.48801 4.5 1.12557V0.65625Z" :fill="color"/>
    <path d="M10.1875 0.65625C10.1875 0.293813 10.4813 0 10.8438 0C11.2062 0 11.5 0.293813 11.5 0.65625V1.12557C11.5 1.48801 11.2062 1.78182 10.8438 1.78182C10.4813 1.78182 10.1875 1.48801 10.1875 1.12557V0.65625Z" :fill="color"/>
    <path d="M3.1875 7.92744C3.1875 7.48561 3.54567 7.12744 3.9875 7.12744H4.575C5.01683 7.12744 5.375 7.48561 5.375 7.92744V8.55471C5.375 8.99654 5.01683 9.35471 4.575 9.35471H3.9875C3.54567 9.35471 3.1875 8.99654 3.1875 8.55471V7.92744Z" :fill="color"/>
  </svg>
</template>

<script>
export default {
  name: 'calendar-icon-outlined',
  props: {
    width: {
      type: [Number, String],
      default: 16
    },
    height: {
      type: [Number, String],
      default: 15
    },
    color: {
      type: String,
      default: '#62666E'
    }
  }
}
</script>
