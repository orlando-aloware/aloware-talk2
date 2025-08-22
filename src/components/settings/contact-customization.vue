<template>
  <b-container>
    <b-form>
      <b-form-row>
        <b-col sm="12" md="12">
          <div class="d-inline-flex">
            <slot name="header">
            </slot>
            <h1 class="mt-2">Contact Customization</h1>
          </div>
        </b-col>
      </b-form-row>
    </b-form>
  </b-container>
</template>

<script>
export default {
  name: 'contact-customization'
}
</script>

<style>

</style>
