<template>
  <svg :width="width" :height="height" viewBox="0 0 14 6" fill="none" xmlns="http://www.w3.org/2000/svg" data-testid="hangup-icon">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M9.36765 4.85853C9.43425 5.2134 9.5559 5.3938 9.98172 5.55152C10.6141 5.786 12.3543 6.11844 12.9708 5.81987C13.2555 5.68202 13.4158 5.4172 13.5179 5.01444C13.8191 3.82852 13.4324 2.89897 12.5605 2.09635C9.60743 -0.622467 4.00831 -0.619232 1.05742 2.0975C0.185868 2.89965 -0.200143 3.82887 0.101458 5.01507C0.203833 5.41789 0.364274 5.68279 0.649166 5.82067C1.26564 6.1197 3.00568 5.78819 3.63795 5.55405C4.06382 5.39642 4.18524 5.21622 4.25166 4.86138C4.4751 3.66304 3.85089 3.04456 5.25752 2.73789C6.31244 2.50796 7.30592 2.504 8.3607 2.7345C9.76749 3.04193 9.14348 3.6602 9.36765 4.85853Z" :fill="color"/>
  </svg>
</template>

<script>
export default {
  name: 'hangup-icon',
  props: {
    width: {
      type: [Number, String],
      default: 14
    },
    height: {
      type: [Number, String],
      default: 6
    },
    color: {
      type: String,
      default: '#EB5757'
    }
  }
}
</script>
