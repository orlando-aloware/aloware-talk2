<template>
  <div>
    <b-form>
      <b-form-group label="Tags">

      </b-form-group>
    </b-form>
  </div>
</template>

<script>
export default {
  name: 'contact-tags-form',
  data () {
    return {
      tags: [],
      options: ['Google', 'Facebook', 'Twitter', 'Apple', 'Oracle']
    }
  }
}
</script>

<style scoped>

</style>
