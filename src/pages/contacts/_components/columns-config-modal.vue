<template>
  <b-modal
    v-model="isOpen"
    size="lg"
    title="Choose which columns you see"
    modal-class="column-config-modal"
    scrollable
  >
    <div class="column-config-modal__inner row">
      <div class="col-lg-6 px-0">
        <div class="flex flex-column pr-2 pl-4">
          <div class="mb-2">
            <contacts-table-search />
          </div>
          <div class="column-config-modal__checkboxes">
            <div
              class="column-config-modal__item d-flex align-items-center"
              v-for="column in columns"
              :key="column.id"
            >
              <div class="pl-2">
                <b-form-checkbox
                  value="accepted"
                  unchecked-value="not_accepted"
                >
                </b-form-checkbox>
              </div>
              <div
                class="flex-grow-1 pl-1 column-config-modal__label"
              >
                {{ column.label }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-6 px-0">
        <div class="px-3">
          <div
            class="font-weight-bold body text-uppercase column-config-modal__selecteds"
          >
            Selected Columns
          </div>
          <div class="d-flex flex-column">
            <draggable
              v-model="columns"
              ghost-class="ghost"
              @start="isDragging = true"
              @end="isDragging = false"
            >
              <transition-group type="transition" name="flip-list">
                <div
                  class="column-config-modal__item border px-2 py-1 mb-2 d-flex align-items-center"
                  v-for="column in columns"
                  :key="column.id"
                >
                  <i class="fa fa-align-justify" aria-hidden="true"></i>
                  <div class="flex-grow-1 pl-2 column-config-modal__label">
                    {{ column.label }}
                  </div>
                  <button
                    class="d-inline column-config-modal__remove btn btn-sm btn-link m-0 p-0"
                  >
                    <i class="fa fa-times"></i>
                  </button>
                </div>
              </transition-group>
            </draggable>
          </div>
        </div>
      </div>
    </div>
    <template slot="modal-footer">
      <div class="w-100 d-flex align-items-center">
        <div class="d-flex align-items-center">
          <b-button
            variant="success mr-2"
            class="custom-btn"
            @click="isOpen = false"
            >Apply</b-button
          >
          <b-button
            variant="outline-success mr-2"
            class="custom-btn"
            @click="isOpen = false"
            >Cancel</b-button
          >
        </div>
        <div class="flex-grow-1"></div>
        <b-button
          variant="link"
          size="sm"
          class="font-weight-bold text-danger text-decoration-none"
          @click="isOpen = false"
          >Remove all columns</b-button
        >
      </div>
    </template>
  </b-modal>
</template>

<script>
import draggable from 'vuedraggable'
import ContactsTableSearch from './contacts-table-search.vue'

export default {
  components: {
    draggable,
    ContactsTableSearch
  },
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
      isOpen: false,
      columns: [
        {
          id: 1,
          label: 'Company',
          fieldName: 'company',
          sortable: true,
          draggable: true,
          sticky: true,
          order: 0
        },
        {
          id: 2,
          label: 'Contact',
          fieldName: 'contact',
          sortable: true,
          draggable: true,
          order: 1
        },
        {
          id: 3,
          label: 'Phone Number',
          fieldName: 'phone',
          sortable: true,
          draggable: true,
          order: 2
        },
        {
          id: 4,
          label: 'Sex',
          fieldName: 'sex',
          sortable: true,
          draggable: true,
          order: 3
        },
        {
          id: 5,
          label: 'Custom Field 1',
          fieldName: 'test1',
          sortable: true,
          draggable: true,
          order: 5
        },
        {
          id: 6,
          label: 'Custom Field 2',
          fieldName: 'test2',
          sortable: true,
          draggable: true,
          order: 6
        },
        {
          id: 7,
          label: 'Custom Field 3',
          fieldName: 'test3',
          sortable: true,
          draggable: true,
          order: 7
        }
      ]
    }
  }
}
</script>

<style lang="scss">
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
@import 'src/css/breakpoints.scss';
.column-config-modal {
  max-height: 100%;
  @include screen('lg') {
    max-height: 80%;
  }
  .ghost {
    border: dashed 1px $green !important;
  }
  &__checkboxes {
    max-height: calc(100% - 50px);
  }
  &__remove {
    width: 10px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    line-height: 10px;
  }
  &__selecteds {
    font-size: 14px;
    margin-bottom: 15px;
  }
  &__item {
    height: 35px;
    cursor: move;
    &:hover {
      background-color: $light-green2;
    }
    i {
      color: $grey-2;
      font-size: 10px;
    }
  }
  &__label {
    font-size: 14px;
  }
  &__inner {
    min-height: 300px;
  }
  .modal-title {
    color: $white;
  }
  .modal-header {
    background-color: $dark;
    border-radius: 0;
    padding: 15px;
    .close {
      color: $white;
    }
  }
  .modal-content {
    border-radius: 0;
    border: none;
  }
  .modal-footer {
    .custom-btn {
      min-width: 120px;
    }
  }
}
</style>
