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

      <div class="pt-3">
        <input
          type="text"
          class="form-control"
          placeholder="Untitled List"
          autofocus
          v-model="name"
        />
      </div>

      <div class="flex-grow-1 py-4">
        <div class="form-check mb-2" @click="type = 'dynamic'">
          <input
            class="form-check-input"
            type="radio"
            id="dynamicList"
            :checked="type === 'dynamic'"
          />
          <label for="dynamicList">
            <div class="create-list-modal__list-title">Dynamic List</div>
            <div class="create-list-modal__list-desc">
              Automatically updates based off a filter; contacts join or leave
              as their properties change
            </div>
          </label>
        </div>

        <div class="form-check" @click="type = 'static'">
          <input
            class="form-check-input"
            type="radio"
            id="staticList"
            :checked="type === 'static'"
          />
          <label for="staticList">
            <div class="create-list-modal__list-title">Static List</div>
            <div class="create-list-modal__list-desc">
              Automatically updates based off a filter; contacts join or leave
              as their properties change
            </div>
          </label>
        </div>
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
      isOpen: true,
      name: null,
      type: 'dynamic'
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
  .modal-body {
    padding: 0;
  }
  &__body {
    padding: 40px;
  }
  &__title {
    font-size: 18px;
    font-weight: 400;
    color: $black;
  }
  &__close {
    margin-right: -15px;
    margin-top: -30px;
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
