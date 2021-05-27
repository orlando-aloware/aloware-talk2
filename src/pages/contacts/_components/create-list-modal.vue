<template>
  <b-modal
    v-model="isOpen"
    title="Create A List"
    scrollable
    centered
    hide-footer
    hide-header
    size="lg"
    modal-class="create-list-modal"
  >
    <div class="d-flex flex-column create-list-modal__body position-relative">
      <div class="d-flex align-items-center">
        <div class="flex-grow-1 create-list-modal__title">New List</div>
        <button
          class="btn btn-link small text-muted create-list-modal__close"
          @click="close"
        >
          <i class="fa fa-times"></i>
        </button>
      </div>

      <div class="mt-4 mb-4">
        <input type="text" class="form-control" placeholder="Name..." autofocus />
      </div>

      <div class="form-check mb-2">
        <input class="form-check-input" type="radio" id="dynamicList" />
        <label for="dynamicList">
          <div class="create-list-modal__list-title">Dynamic List</div>
          <div class="create-list-modal__list-desc">
            Automatically updates based off a filter; contacts join or leave as
            their properties change
          </div>
        </label>
      </div>

      <div class="form-check mb-4">
        <input class="form-check-input" type="radio" id="staticList" />
        <label for="staticList">
          <div class="create-list-modal__list-title">Static List</div>
          <div class="create-list-modal__list-desc">
            Automatically updates based off a filter; contacts join or leave as
            their properties change
          </div>
        </label>
      </div>

      <div class="d-flex align-items-center">
        <button class="btn btn-block btn-light mt-0 mr-2" @click="close">
          Cancel
        </button>
        <button class="btn btn-block btn-primary mt-0">Create</button>
      </div>
    </div>
  </b-modal>
</template>

<script>
export default {
  components: {},
  methods: {
    open () {
      this.isOpen = true
    },
    close () {
      this.isOpen = false
    }
  },
  data () {
    return {
      isOpen: true
    }
  }
}
</script>

<style lang="scss">
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
@import 'src/css/breakpoints.scss';
.create-list-modal {
  .modal-lg {
    @media (min-width: 992px) {
      max-width: 650px;
    }
  }
  &__body {
    padding: 20px;
  }
  &__title {
    font-size: 18px;
    font-weight: 400;
    color: $black;
  }
  &__close {
    margin-right: -15px;
    margin-top: -15px;
  }
  &__list-title {
    font-size: 14px;
    font-weight: 600;
    color: $black;
  }
  &__list-desc {
    font-size: 13px;
    color: $grey-light5;
  }
}
</style>
