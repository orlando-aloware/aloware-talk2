<template>
  <svg :width="width"
       :height="height"
       viewBox="0 0 18 18"
       fill="none"
       xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M4.49604 1.07812H14.0042C15.7546 1.07812 17.1736 2.49711 17.1736 4.24751V13.7557C17.1736 15.5061 15.7546 16.925 14.0042 16.925H4.49604C2.74564 16.925 1.32666 15.5061 1.32666 13.7557V4.24751C1.32666 2.49711 2.74564 1.07813 4.49604 1.07812Z" :stroke="color" stroke-width="1.2"/>
    <path d="M1.84033 12.4275H2.82452" :stroke="color" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M1.84033 5.57445H2.82452" :stroke="color" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M8.67924 7.37619C8.82194 7.16602 8.85003 7.01472 8.71279 6.72065C8.50908 6.28379 7.79302 5.23716 7.33237 5.0734C7.11965 4.99775 6.9068 5.04823 6.65481 5.19673C5.9127 5.63384 5.64635 6.2918 5.68892 7.13246C5.83277 9.97978 8.67009 12.8139 11.5153 12.9577C12.3555 13.0003 13.013 12.7338 13.45 11.9913C13.5984 11.7392 13.6489 11.5262 13.5731 11.3134C13.4096 10.8525 12.3635 10.136 11.9269 9.93223C11.6328 9.79492 11.4817 9.82302 11.2717 9.9658C10.5627 10.4484 10.5714 11.0721 9.70651 10.5121C9.05792 10.0922 8.5528 9.59099 8.1332 8.94219C7.57356 8.07686 8.19699 8.08551 8.67924 7.37619Z" :stroke="color" stroke-width="1.2"/>
  </svg>

</template>

<script>
export default {
  name: 'phone-card-icon',
  props: {
    width: {
      type: [Number, String],
      default: 24
    },
    height: {
      type: [Number, String],
      default: 24
    },
    color: {
      type: String,
      default: '#256EFF'
    }
  }
}
</script>
