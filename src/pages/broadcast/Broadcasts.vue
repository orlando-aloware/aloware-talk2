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
    Broadcasts Home Page
    <router-link :to="{ path: '/broadcasts/new' }">
      New
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'broadcasts',

  data: () => ({
    loading: false
  })
}
</script>
