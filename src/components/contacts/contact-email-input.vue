<template>
  <div>
    <q-input class="inline-input"
             placeholder=""
             data-testid="contact-email-input"
             v-model="email" >
      <template v-slot:append>
        <q-icon data-testid="contact-email-icon" name="edit" @click="email = ''" class="cursor-pointer input-edit-icon" />
      </template>
    </q-input>
  </div>
</template>

<script>
export default {
  name: 'contact-email-input',
  data () {
    return {
      email: this.value
    }
  }
}
</script>

<style scoped>
  .input-edit-icon {
    font-size: 60%;
  }
</style>
