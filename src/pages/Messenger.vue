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
export default {
  name: 'Messenger',

  created () {
    this.getIntegration('messenger')
  }
}
</script>
