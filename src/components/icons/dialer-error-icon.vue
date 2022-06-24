<template>
  <svg :width="width"
       :height="height"
       viewBox="0 0 40 40"
       fill="none"
       xmlns="http://www.w3.org/2000/svg">
    <rect :width="width"
          :height="height"
          rx="8"
          :fill="bgColor"/>
    <path :fill="textColor"
          d="m23.7917,9.16699c1.4957,0 2.7083,1.21261 2.7083,2.70831l0,16.25c0,1.4958 -1.2126,2.7084 -2.7083,2.7084l-7.5834,0c-1.4957,0 -2.7083,-1.2126 -2.7083,-2.7084l0,-16.25c0,-1.4957 1.2126,-2.70831 2.7083,-2.70831l7.5834,0zm-6.6335,1.40831l-0.6249,0c-0.8446,0 -1.5388,0.6445 -1.6175,1.4685l-0.0075,0.1565l0,15.6c0,0.8447 0.6445,1.5388 1.4685,1.6176l0.1565,0.0074l6.9334,0c0.8446,0 1.5388,-0.6444 1.6175,-1.4685l0.0075,-0.1565l0,-15.6c0,-0.8446 -0.6445,-1.5388 -1.4685,-1.6175l-0.1565,-0.0075l-0.6249,0c-0.1196,0 -0.2274,0.0654 -0.2839,0.1667l-0.0274,0.0649l-0.093,0.3101c-0.0857,0.2858 -0.3291,0.4915 -0.6178,0.5337l-0.1102,0.008l-3.419,0c-0.2983,0 -0.5653,-0.174 -0.6887,-0.4385l-0.0393,-0.1032l-0.093,-0.3101c-0.0413,-0.1374 -0.1678,-0.2316 -0.3113,-0.2316zm4.4668,16.3584c0.359,0 0.65,0.291 0.65,0.65c0,0.323 -0.2357,0.5911 -0.5446,0.6415l-0.1054,0.0085l-3.25,0c-0.359,0 -0.65,-0.2911 -0.65,-0.65c0,-0.3231 0.2357,-0.5912 0.5446,-0.6415l0.1054,-0.0085l3.25,0z"
          clip-rule="evenodd"
          fill-rule="evenodd"/>
    <text xml:space="preserve"
          text-anchor="start"
          font-family="'Raleway'"
          font-size="24"
          y="24.56328"
          x="7.88211"
          stroke-width="0"
          stroke="#000"
          :fill="textColor">!</text>
  </svg>
</template>

<script>
export default {
  name: 'dialer-error-icon',
  props: {
    bgColor: {
      type: String,
      default: '#FA003F',
      required: false
    },
    textColor: {
      type: String,
      default: '#FFFFFF',
      required: false
    },
    height: {
      type: String,
      default: '40',
      required: false
    },
    width: {
      type: String,
      default: '40',
      required: false
    }
  }
}
</script>
