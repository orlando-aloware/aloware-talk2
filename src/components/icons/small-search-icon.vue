<template>
  <svg :width="width"
       :height="height" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>Small Search Icon</title>
    <defs>
      <filter id="filter-1">
        <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0.600000 0 0 0 0 0.600000 0 0 0 0 0.600000 0 0 0 1.000000 0"></feColorMatrix>
      </filter>
      <rect id="path-2" x="0" y="0" width="24" height="24"></rect>
    </defs>
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g transform="translate(-522.000000, -88.000000)">
        <g transform="translate(360.000000, 75.000000)">
          <g transform="translate(157.000000, 10.000000)" filter="url(#filter-1)">
            <g transform="translate(5.000000, 3.000000)" id="edit-/-search_small">
              <mask id="mask-3" fill="white">
                <use xlink:href="#path-2"></use>
              </mask>
              <path d="M14.2337866,12.8100333 C15.5286685,10.8555689 15.3151104,8.19634414 13.593111,6.47434473 C11.627318,4.50855172 8.44013762,4.50855184 6.47434473,6.47434473 C4.50855172,8.44013774 4.50855172,11.627318 6.47434473,13.593111 C8.19634414,15.3151104 10.8555686,15.5286689 12.8100333,14.2337866 L17.5762463,19 L19,17.5762463 L14.2337866,12.8100333 C15.0970412,11.507057 15.0970412,11.507057 14.2337866,12.8100333 Z M12.1693578,7.89809775 C13.3488336,9.07757354 13.3488336,10.989882 12.1693578,12.1693578 C10.989882,13.3488336 9.07757378,13.3488336 7.89809799,12.1693578 C6.71862221,10.989882 6.71862221,9.07757354 7.89809799,7.89809775 C9.07757378,6.71862197 10.989882,6.71862197 12.1693578,7.89809775 C12.955675,8.68441494 12.955675,8.68441494 12.1693578,7.89809775 Z" :class="`svg-fill-${iconColor}`" mask="url(#mask-3)"></path>
            </g>
          </g>
        </g>
      </g>
    </g>
  </svg>
</template>

<script>
export default {
  name: 'small-search-icon',
  props: {
    width: {
      type: [Number, String],
      default: 20
    },
    height: {
      type: [Number, String],
      default: 20
    },
    iconColor: {
      type: String,
      default: 'grey-mid'
    }
  }
}
</script>

<style scoped>

</style>
