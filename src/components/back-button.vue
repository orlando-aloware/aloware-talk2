<template>
  <q-btn borderless
         flat
         class="mobile-back-btn"
         data-testid="back-button-btn"
         @click="$emit('click')">
    <back-button-icon  data-testid="back-button-icon"/>
  </q-btn>
</template>

<script>
import BackButtonIcon from 'components/icons/back-button-icon'
export default {
  name: 'back-button',
  components: { BackButtonIcon }
}
</script>
