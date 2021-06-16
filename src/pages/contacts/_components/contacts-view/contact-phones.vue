<template>
  <b-card class="mt-2 mb-2 border-0">
    <h6>Other Numbers</h6>
    <div>
      <div>
        <small class="text-muted">Wireless</small>
      </div>
      <div class="d-flex justify-content-between">
        <p class="phone-number m-0">775-895-2264</p>
        <div class="options p-0">
          <b-button size="sm"
                    variant="light">
            <i class="material-icons">edit</i>
          </b-button>

          <b-dropdown no-caret
                      variant="light"
                      class="m-md-2"
                      size="sm"
                      offset="-125">
            <template slot="button-content">
              <i class="material-icons">more_vert</i>
            </template>
            <b-dropdown-item><i class="material-icons">description</i> Text</b-dropdown-item>
            <b-dropdown-item><i class="material-icons">phone</i> Call</b-dropdown-item>
            <b-dropdown-item><i class="material-icons">print</i> Fax</b-dropdown-item>
            <b-dropdown-item><i class="material-icons">delete</i> Delete</b-dropdown-item>
          </b-dropdown>
        </div>
      </div>
    </div>
  </b-card>
</template>

<script>
export default {
  name: 'contact-phones'
}
</script>

<style lang="scss" scoped>
  .phone-number {
    font-size: 0.90rem;
  }

  div.options {
    margin-top: -14px;
  }
</style>
