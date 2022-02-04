<template>
  <b-modal
      v-model="isOpen"
      title="Create A List"
      size="lg"
      modal-class="create-list-modal"
      scrollable
      centered
      hide-footer
      hide-header
      no-close-on-esc
    >
      <b-overlay
        :show="isLoading"
        spinner-variant="primary"
        spinner-type="grow"
        spinner-small
        rounded="sm"
      >
        <div class="d-flex flex-column create-list-modal__body position-relative">
          <div class="d-flex align-items-center">
            <div class="flex-grow-1 create-list-modal__title">{{ getTitle }}</div>
            <button
              class="btn btn-link small text-muted create-list-modal__close"
              @click="onClose"
            >
              <i class="fa fa-times"></i>
            </button>
          </div>

          <div class="pt-3">
            <input
              type="text"
              class="form-control"
              placeholder="Untitled List"
              :disabled="isLoading"
              autofocus
              v-model="createList.name"
            />
          </div>

          <div
            class="flex-grow-1 py-4"
            v-if="![CreateListMode.FROM_FILTERS, CreateListMode.FROM_BULK_MENU].includes(createList.mode) && isDefault">
            <div
              class="form-check mb-2"
              @click="createList.type = ContactListTypes.DYNAMIC">
              <input
                class="form-check-input"
                type="radio"
                id="dynamicList"
                :checked="createList.type === ContactListTypes.DYNAMIC"
              />
              <label for="dynamicList">
                <div class="create-list-modal__list-title">Dynamic List</div>
                <div class="create-list-modal__list-desc">
                  Automatically updates based off a filter; contacts join or leave
                  as their properties change
                </div>
              </label>
            </div>
            <div
              class="form-check"
              @click="createList.type = ContactListTypes.STATIC">
              <input
                class="form-check-input"
                type="radio"
                id="staticList"
                :checked="createList.type === ContactListTypes.STATIC"
              />
              <label for="staticList">
                <div class="create-list-modal__list-title">Static List</div>
                <div class="create-list-modal__list-desc">
                  Does not Automatically update; able to manually select and
                  adjust order of contacts
                </div>
              </label>
            </div>
          </div>

          <div class="text-red">
            {{ errorMsg }}
          </div>

          <div class="d-flex align-items-center pt-3">
            <button
              class="btn btn-block btn-light mt-0 mr-2"
              @click="onClose"
              :disabled="isLoading"
            >
              Cancel
            </button>
            <button
              class="btn btn-block btn-primary mt-0"
              @click="onSubmit"
              :disabled="!isNameValid || isLoading"
            >
              Create
            </button>
          </div>
        </div>
      </b-overlay>
    </b-modal>
</template>

<script>
export default {
  name: 'communication-report-issue-dialog',

  data () {
    return {
      isOpen: false,
      isLoading: false
    }
  }
}
</script>
