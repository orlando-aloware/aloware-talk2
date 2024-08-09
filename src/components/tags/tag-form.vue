<template>
  <b-modal id="tags-form-modal"
           modal-class="tags__modal"
           centered
           v-model="openModal"
           @hide="closeModalPrompt"
           @show="openTagForm">
    <b-overlay rounded="sm"
               no-wrap
               :show="true"
               v-show="loading">
      <template #overlay>
        <q-spinner-bars color="primary"
                        size="30px" />
      </template>
    </b-overlay>

    <template #modal-title>
      <h6>{{ formName }}</h6>
    </template>

    <b-form ref="tagForm"
            class="tags__form">
      <b-form-group class="font-weight-light text-13"
                    label="Name"
                    invalid-feedback="Please provide a tag name"
                    :state="validateState('name')">
        <b-form-input placeholder="Enter tag name"
                      data-testid="tags-edit-modal-input-name"
                      v-model="$v.tag.name.$model"
                      required />
      </b-form-group>

      <b-row>
        <b-col class="p-0"
               cols="2">
          <b-form-group class="font-weight-light text-13"
                        label="Color"
                        invalid-feedback="Please select a tag color"
                        :state="validateState('color')">
            <b-dropdown variant="light"
                        size="sm"
                        data-testid="tags-edit-modal-color"
                        class="color-picker">
              <template #button-content>
                <i class="fa fa-square fa-2x"
                   :style="{ color: tag.color }">
                </i>
              </template>

              <b-dropdown-item :key="`color-${option}`"
                               v-for="option in colorOptions"
                               @click="selectTagColor(option)">
                  <span class="color-pick"
                        :class="[tag.color === option ? 'selected' : '']">
                    <i class="fa fa-square fa-2x mx-1"
                       :style="{ color: option }">
                    </i>
                  </span>
              </b-dropdown-item>
            </b-dropdown>
          </b-form-group>
        </b-col>

        <b-col class="px-0">
          <b-form-group class="font-weight-light text-13"
                        label="Category"
                        invalid-feedback="Please select a tag category"
                        :state="validateState('category')">
            <vue-multiselect track-by="value"
                             label="name"
                             class="mr-1 chip__clear-blue shrink-options"
                             placeholder="Select category"
                             :searchable="true"
                             :showNoResults="false"
                             :close-on-select="true"
                             :options="categoryOptions"
                             :show-labels="false"
                             :allow-empty="false"
                             :disabled="disabled"
                             data-testid="tags-edit-modal-category"
                             v-model="category"
                             @select="selectTagCategory" />
          </b-form-group>
        </b-col>
      </b-row>

      <b-form-group class="font-weight-light text-13"
                    invalid-feedback="The description may not be greater than 190 characters."
                    :state="validateState('description')">
        <template #label>
          <b-row>
            <b-col class="px-0 text-left">Description (Optional)</b-col>
            <b-col class="px-0 text-right">
              <span :class="[tagDescriptionLength > 190 ? 'text-danger font-weight-bold' : '']">{{ tagDescriptionLength }}</span>/190
            </b-col>
          </b-row>

        </template>
        <b-form-textarea id="textarea"
                         rows="3"
                         placeholder="Enter tag description"
                         data-testid="tags-edit-modal-description"
                         v-model="$v.tag.description.$model"/>
      </b-form-group>
    </b-form>

    <template #modal-footer>
      <div class="mt-2 d-flex w-100">
        <div class="ml-auto">
            <button class="btn btn-sm btn-outline-dark mr-2"
                    data-testid="tags-edit-modal-cancel-button"
                    @click.prevent="closeModalPrompt">
              Cancel
            </button>
            <button class="btn btn-sm bg-primary text-white"
                    :disabled="$v.$invalid"
                    data-testid="tags-edit-modal-update-button"
                    @click.prevent="saveTag">
              {{ submitButtonLabel }}
            </button>
        </div>
      </div>
    </template>
  </b-modal>
</template>

<script>
import { TAG_CATEGORIES } from 'src/constants/tag-categories'
import { tagsMixin } from 'src/plugins/mixins'
import VueMultiselect from 'vue-multiselect'
import { required, numeric, maxLength } from 'vuelidate/lib/validators'
import API from 'src/plugins/api/api'

export default {
  name: 'tag-form',

  components: {
    VueMultiselect
  },

  mixins: [
    tagsMixin
  ],

  props: {
    isShow: {
      type: Boolean,
      required: true
    },

    tagCategory: {
      type: Number,
      required: true
    },

    editableTag: {
      type: Object,
      required: false
    }
  },

  data () {
    return {
      loading: false,
      tag: {
        name: null,
        color: '#CA66D6',
        description: null,
        category: null
      },
      category: null,
      categoryOptions: [
        {
          value: TAG_CATEGORIES.CAT_COMMUNICATIONS,
          name: 'Communication'
        },
        {
          value: TAG_CATEGORIES.CAT_CONTACTS,
          name: 'Contacts'
        }
      ],
      colorOptions: [
        '#4EA8E1',
        '#4373F5',
        '#6A54F6',
        '#924BE8',
        '#8F3AB8',
        '#CA66D6',
        '#D55699',
        '#C33953',
        '#D54D3C',
        '#E89246',
        '#EDCE50',
        '#A0C83D',
        '#84CE7A',
        '#6AC1AC',
        '#B5BECC',
        '#6B6B6B'
      ],
      disabled: false
    }
  },

  validations () {
    return {
      tag: {
        name: {
          required
        },
        color: {
          required
        },
        category: {
          required,
          numeric
        },
        description: {
          maxLength: maxLength(190)
        }
      }
    }
  },

  mounted () {
    this.setTag()
    this.setTagCategory(this.presetCategory)
  },

  computed: {
    openModal: {
      get () {
        return this.isShow
      },

      set (isShow) {
        return isShow
      }
    },

    formName () {
      return this.editableTag
        ? `Edit ${this.getTagCategoryName(this.tag.category)} Tag`
        : `Create New ${this.getTagCategoryName(this.tag.category)} Tag`
    },

    presetCategory () {
      return this.editableTag ? this.editableTag.category : this.tagCategory
    },

    submitButtonLabel () {
      return this.editableTag ? 'Update' : 'Add'
    },

    tagDescriptionLength () {
      return (this.tag && this.tag?.description)
        ? this.tag.description.length
        : 0
    }
  },

  methods: {
    validateState (input) {
      const { $dirty, $error } = this.$v.tag[input]
      return $dirty ? !$error : null
    },

    setTag () {
      if (!this.editableTag) {
        return
      }

      this.tag.name = this.editableTag.name
      this.tag.color = this.editableTag.color
      this.tag.category = this.editableTag.category
      this.tag.description = this.editableTag.description
      this.disabled = true
    },

    setTagCategory (category) {
      this.category = this.categoryOptions.find(option => option.value === category)
      this.tag.category = this.category.value
    },

    openTagForm () {
      // Add data-testid to elements that can't be accessed inside template code
      this.$nextTick(() => {
        document.querySelector('.modal-header > .close').setAttribute('data-testid', 'tags-edit-modal-close-button')
        document.querySelector('[data-testid="tags-edit-modal-category"] input').setAttribute('data-testid', 'tags-edit-modal-category-input')
      })

      this.setTag()
      this.setTagCategory(this.presetCategory)
    },

    selectTagCategory (category) {
      this.setTagCategory(category.value)
    },

    selectTagColor (color) {
      this.tag.color = color
    },

    closeModalPrompt (bvModalEvent) {
      if (!this.$v.tag.$anyDirty) {
        this.closeTagForm()
        return
      }

      bvModalEvent.preventDefault()

      this.$bvModal.msgBoxConfirm(`Are you sure you want to close the ${this.formName} form?`, {
        title: `Close ${this.formName}`,
        okTitle: 'Yes, I\'m sure',
        cancelTitle: 'No, I\'m not',
        size: 'sm',
        buttonSize: 'sm',
        centered: true,
        footerClass: 'close-edit-modal-footer-class'
      })
        .then(confirm => {
          if (confirm) {
            this.closeTagForm()
          }
        })

      this.$nextTick(() => {
        document.querySelector('.close-edit-modal-footer-class > .btn-primary').setAttribute('data-testid', 'tags-close-edit-modal-confirm-button')
        document.querySelector('.close-edit-modal-footer-class > .btn-secondary').setAttribute('data-testid', 'tags-close-edit-modal-cancel-button')
        console.log('Button', document.querySelector('.close-edit-modal-footer-class > .btn-primary'))
      })
    },

    closeTagForm () {
      this.$emit('closeTagForm')
      this.resetForm()
    },

    resetForm () {
      this.tag = {
        name: null,
        color: '#CA66D6',
        description: null,
        category: null
      }

      this.$v.$reset()

      this.category = null
      this.disabled = false
    },

    saveTag () {
      this.$v.$touch()
      this.loading = true
      let xhr = null
      let msg = ''

      if (this.editableTag) {
        // edit/update api
        xhr = API.V1.tags.update(this.editableTag.id, { ...this.tag })
        msg = this.tagCategoryName + ' tag updated successfully'
      } else {
        // add api
        xhr = API.V1.tags.create(this.tag)
        msg = this.tagCategoryName + ' tag created successfully'
      }

      xhr
        .then(() => {
          this.loading = false
          this.$generalNotification(msg)
          this.closeTagForm()
        })
        .catch(err => {
          this.$handleErrors(err.response)
          this.loading = false
          console.log(err)
        })
    }
  }
}
</script>
<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
