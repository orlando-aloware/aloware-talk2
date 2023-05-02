<template>
  <div class="broadcast position-relative">
    <b-overlay class="h-100 w-100 position-absolute"
               rounded="sm"
               :show="true"
               v-show="loading">
      <template #overlay>
        <q-spinner-bars color="primary"
                        size="40px" />
      </template>
    </b-overlay>
    Broadcasts Add Page
    <router-link :to="{ path: '/broadcasts' }">
      Back
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'broadcast-add',

  data: () => ({
    loading: false
  })
}
</script>
