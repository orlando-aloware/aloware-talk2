<template>
  <b-card class="mt-2 mb-2 border-0 position-relative">
    <h6>About this contact</h6>

    <div class="pb-4 summary-container">
      <div class="d-inline-flex">
        <div class="label">
          <i class="material-icons">person_outline</i> Owner:
        </div>
        <div class="value">
          Hubspot Integration
        </div>
      </div>

      <div class="d-inline-flex">
        <div class="label">
          <i class="material-icons">mail_outline</i> Email:
        </div>
        <div class="value">
          walterb@company.io
        </div>
      </div>

      <div class="d-inline-flex">
        <div class="label">
          <i class="material-icons">fmd_good</i> City &amp; State:
        </div>
        <div class="value">
          San Francisco, CA
        </div>
      </div>

      <div class="d-inline-flex">
        <div class="label">
          <i class="material-icons">language</i> Website:
        </div>
        <div class="value">
          www.website.com
        </div>
      </div>
    </div>

    <b-button pill
              variant="light"
              size="sm"
              class="contact-summary-toggle" @click="onExpanded">
      <i class="material-icons">{{ is_expanded ? 'expand_less' : 'expand_more' }}</i>
    </b-button>
  </b-card>
</template>

<script>
export default {
  name: 'contact-summary',
  data () {
    return {
      is_expanded: false
    }
  },
  methods: {
    onExpanded () {
      this.is_expanded = !this.is_expanded
    }
  }
}
</script>

<style lang="scss" scoped>
  .summary-container{
    font-size: 90%;
  }

  .contact-summary-toggle {
    background: transparent;
    border: 1px solid #dee2e6;
    position: absolute;
    margin: 0;
    left: 50%;
    -ms-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
  }

  div.label {
    font-size: 1em;
    display: inline-block;
    width: 90px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #6c757d !important;
    padding-right: 8px;
  }

</style>
