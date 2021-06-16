<template>
  <b-card class="mt-2 mb-2 border-0">
    <b-media>
      <template #aside>
        <b-avatar class="mr-2 contact-avatar"
                  size="2.5rem"
                  text="WB">
        </b-avatar>
      </template>

      <div class="d-flex justify-content-between relative-position">
        <div>
          <h6 class="mt-0">Walter Bowman</h6>
          <p class="contact-phone">
            (514) 423 3566 <i class="material-icons">content_copy</i>
          </p>
        </div>
        <b-button class="btn-edit-contact-info" size="sm"
                  variant="light">
          <i class="material-icons">edit</i>
        </b-button>
      </div>
    </b-media>
    <div class="d-flex justify-between">
      <b-button variant="secondary" size="sm" class="custom-action-button"><i class="material-icons">call</i></b-button>
      <b-button variant="secondary" size="sm" class="custom-action-button"><span class="material-icons">calendar_today</span></b-button>
      <b-button variant="secondary" size="sm" class="custom-action-button"><i class="material-icons">timer</i></b-button>
      <b-button variant="secondary" size="sm" class="custom-action-button"><i class="material-icons">add_ic_call</i></b-button>
    </div>
  </b-card>
</template>

<script>
export default {
  name: 'contact-info'
}
</script>

<style lang="scss" scoped>
  .contact-phone{
    font-size: 0.80rem;
    margin-top: -5px;
    right: 0;
  }

  .btn-edit-contact-info {
    position: absolute;
    right: 0;
    top: 5px;
    background-color: transparent !important;
  }

  .custom-action-button {
    background: #F4F4F6;
    color: #62666E;
    border: none;
  }
</style>
