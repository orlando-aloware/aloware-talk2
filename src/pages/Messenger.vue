<template>
  <div class="row w-100">
    <div class="messenger-container w-100 vh-100">
      <iframe frameborder="0"
              class="w-100 h-100"
              :src="source">
      </iframe>
    </div>
  </div>
</template>

<script>
import { resellerMixin } from 'src/plugins/mixins'

export default {
  name: 'Messenger',

  mixins: [ resellerMixin ],

  created () {
    this.getIntegration('messenger')
  }
}
</script>
