<template>
  <b-modal id="tags-form-modal"
           :title="title"
           no-close-on-esc
           no-close-on-backdrop
           v-model="openModal"
           @hidden="closeTagForm"
           @show="openTagForm">

    <b-form ref="tagForm"
            class="tags__form">
      <b-form-group class="font-weight-light text-13"
                    label="Name"
                    invalid-feedback="Please provide a tag name"
                    :state="validateState('name')">
        <b-form-input v-model.trim="$v.tag.name.$model"
                      placeholder="Enter tag name"
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
                        class="color-picker">
              <template #button-content>
                <i class="fa fa-square fa-2x"
                  :style="{ color: tag.color }"></i>
              </template>

              <b-dropdown-item v-for="option in colorOptions"
                               :key="`color-${option}`"
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
                        label="Category">
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
                             v-model="category"
                             invalid-feedback="Please select a tag category"
                             :state="validateState('category')"
                             @select="selectTagCategory"/>
          </b-form-group>
        </b-col>
      </b-row>

      <b-form-group class="font-weight-light text-13"
                    label="Description (Optional)">
        <b-form-textarea id="textarea"
                         v-model="tag.description"
                         placeholder="Enter tag description"
                         rows="3"/>
      </b-form-group>
    </b-form>

    <template #modal-footer>
      <div class="mt-2 d-flex w-100">
        <div class="ml-auto">
            <button class="btn btn-sm btn-outline-dark mr-2"
                    @click.prevent="closeTagForm">
              Cancel
            </button>
            <button class="btn btn-sm bg-primary text-white"
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
import { required, numeric } from 'vuelidate/lib/validators'
import axios from 'axios'

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

    title () {
      return this.editableTag
        ? `Edit ${this.getTagCategoryName(this.tag.category)} Tag`
        : `Create a New ${this.getTagCategoryName(this.tag.category)} Tag`
    },

    presetCategory () {
      return this.editableTag ? this.editableTag.category : this.tagCategory
    },

    submitButtonLabel () {
      return this.editableTag ? 'Update' : 'Add'
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
      this.setTag()
      this.setTagCategory(this.presetCategory)
    },

    selectTagCategory (category) {
      this.setTagCategory(category.value)
    },

    selectTagColor (color) {
      this.tag.color = color
    },

    closeTagForm () {
      this.resetForm()
      this.$emit('closeTagForm')
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
      let url = '/api/v1/tag'
      let xhr = null

      if (this.editableTag) {
        // edit/update api
        url += `/${this.editableTag.id}`
        const cloneTag = (({ category, ...o }) => o)(this.tag) // except category
        xhr = axios.patch(url, this.$jsonClone(cloneTag))
      } else {
        // add api
        xhr = axios.post(url, this.tag)
      }

      this.closeTagForm()

      xhr.then(() => {
        // todo: show notification
      })
        .catch(err => {
          console.log(err)
          this.$handleErrors(err.response)
          this.closeTagForm()
        })
    }
  }
}
</script>
<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
