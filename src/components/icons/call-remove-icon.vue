<template>
  <svg :width="width"
       :height="height"
       viewBox="0 0 17 17"
       fill="none"
       xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd"
          clip-rule="evenodd"
          d="M1.95922 1.31937C2.46806 1.0195 2.89782 0.917584 3.32738 1.07034C4.25757 1.40102 5.70365 3.51448 6.11498 4.39664C6.39212 4.99047 6.3354 5.29601 6.04723 5.7204C5.07342 7.15274 3.81449 7.13526 4.94457 8.88263C5.79188 10.1928 6.81186 11.2048 8.12157 12.0529C9.86802 13.1835 9.85063 11.9242 11.2822 10.9496C11.7064 10.6613 12.0114 10.6046 12.6052 10.8819C13.4869 11.2934 15.5993 12.7401 15.9296 13.6708C16.0825 14.1006 15.9806 14.5306 15.6809 15.0397C14.7984 16.5391 13.4707 17.0772 11.774 16.9912C6.02867 16.7008 0.299249 10.9779 0.00877867 5.22821C-0.0771913 3.53065 0.460648 2.20203 1.95922 1.31937Z"
          fill="#FA003F"/>
    <path d="M16 6L11 1"
          stroke="#FA003F"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"/>
    <path d="M16 1L11 6"
          stroke="#FA003F"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"/>
  </svg>
</template>

<script>
export default {
  name: 'call-remove-icon',

  props: {
    width: {
      type: [Number, String],
      default: 16
    },
    height: {
      type: [Number, String],
      default: 16
    }
  }
}
</script>
