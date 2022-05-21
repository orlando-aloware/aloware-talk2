<template>
  <div>
    <q-input class="inline-input"
             v-model="contact.cnam_city" >
      <template v-slot:append>
        <q-icon name="edit" class="cursor-pointer input-edit-icon" />
      </template>
    </q-input>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'location-city-selector',
  computed: {
    ...mapGetters('contacts', ['contact'])
  },
  data () {
    return {
      user_id: this.value,
      options: ['John', 'Deer']
    }
  }
}
</script>
