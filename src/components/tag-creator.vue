<template>
  <div v-if="hasPermissionTo('create tag')">
    <!--create new tag-->
    <q-dialog :title="title"
               class="dialog-padding auto"
               :width="isLargeEnough ? '30%' : '100%'"
               :visible.sync="hideAdd"
               :before-close="beforeCloseModal"
               append-to-body>
      <q-form ref="add_tag"
              class="mt-2 p-0"
              label-position="top"
              :model="tag"
              @submit.prevent.native="addTag">
        <q-field label="Name"
                 stack-label>
          <q-input v-model="tag.name"
                   @input="preValidateForm('add_tag')">
          </q-input>
        </q-field>
        <q-field label="Choose a color"
                 stack-label>
          <q-color v-model="tag.color"
                   no-header
                   no-footer
                   class="d-block"
                   @active="changeTagColor">
          </q-color>
        </q-field>
        <q-field label="Category"
                 stack-label
                 v-if="!categoryProp">
          <q-select ref="tag-select"
                    class="w-full"
                    option-value="name"
                    :option-label="name | translateTagCategories"
                    :placeholder="placeholder"
                    :options="categories"
                    v-model="tag.category">
          </q-select>
        </q-field>
        <q-field label="Description (Optional)"
                 stack-label>
          <q-input type="textarea"
                   v-model="tag.description"
                   rows="2"
                   @input="preValidateForm('add_tag')">
          </q-input>
        </q-field>
      </q-form>

      <div class="row pb-3">
        <div class="col-12">
          <q-btn :disabled="loadingBtn"
                 class="pull-right ml-2"
                 @click="addTag">
            <i class="material-icons loader"
               v-show="loadingBtn">&#xE863;</i>
            <i class="fa fa-plus"
               v-show="!loadingBtn"></i>
            <span>Add</span>
          </q-btn>

          <q-btn class="pull-right"
                 @click="hideAdd = false">
            <span class="fa fa-close"></span>
            <span>Cancel</span>
          </q-btn>
        </div>
      </div>
    </q-dialog>

    <slot name="trigger">
      <b-button type="link"
                class="text-sm text-dark-greenish"
                @click="hideAdd = true">
        <q-icon name="add_circle_outline"/>
        Add Tag
      </b-button>
    </slot>
  </div>
</template>

<script>
import _ from 'lodash'
import {
  aclMixin,
  formValidationMixin
} from 'src/plugins/mixins'
import { TAG_CATEGORIES as TagCategories } from 'src/constants/tag-categories'
export default {
  name: 'tag-creator',

  mixins: [
    aclMixin,
    formValidationMixin
  ],

  props: {
    title: {
      required: false,
      type: String,
      default: 'Create a new tag'
    },
    isFilterTags: {
      required: false,
      type: Boolean,
      default: false
    },
    filters: {
      required: false,
      type: Object,
      default: null
    },
    categoryProp: {
      required: false,
      type: Number,
      default: null
    }
  },

  data () {
    return {
      loadingBtn: false,
      loadingTag: false,
      hideAdd: false,
      tag: {
        color: '#409EFF',
        name: null,
        description: null,
        category: this.categoryProp ? this.categoryProp : null
      },
      categories: [
        {
          name: TagCategories.CAT_CONTACTS
        },
        {
          name: TagCategories.CAT_COMMUNICATIONS
        }
      ],
      rules_tag: {
        color: [
          {
            required: true,
            message: 'Please select a tag color',
            trigger: 'blur'
          }
        ],
        name: [
          {
            required: true,
            message: 'Please provide a tag name',
            trigger: 'blur'
          }
        ],
        category: [
          {
            required: this.categoryProp === null,
            message: 'Please select a category',
            trigger: 'blur'
          }
        ]
      }
    }
  },

  computed: {
    isLargeEnough () {
      return true
    }
  },

  methods: {
    addTag () {
      if (this.validateForm('add_tag')) {
        this.loadingBtn = true
        const url = { data: '/api/v1/tag' }
        const data = _.clone(this.tag)
        if (this.isFilterTags) {
          url.data = '/api/v1/save-filters-tag'
          data.filters = this.filters
          data.filters = _.pickBy(data.filters, _.identity)
        }
        this.$axios.post(url.data, data)
          .then(res => {
            this.loadingBtn = false
            this.hideAdd = false
            this.$emit('success', res.data)
            this.$generalNotification('Tag created')
            this.resetTag()
          })
          .catch(err => {
            this.$handleErrors(err.response)
            this.loadingBtn = false
            this.resetTag()
          })
      }
    },

    resetTag () {
      this.tag = {
        color: '#409EFF',
        name: null,
        description: null,
        category: this.categoryProp ? this.categoryProp : null
      }
    },

    changeTagColor (val) {
      this.tag.color = val
    },

    beforeCloseModal (done) {
      if (this.tag.color || this.tag.name) {
        this.$q.notify({
          color: 'warning',
          timeout: 0,
          message: 'Are you sure you want to leave? Your changes will not be saved.',
          html: true,
          actions: [
            {
              label: 'Yes, Leave',
              color: 'success',
              handler: () => {
                this.resetTag()
                done()
              }
            },
            {
              label: 'No, Stay',
              color: 'danger',
              handler: () => {
                done()
              }
            }
          ]
        })
      } else {
        this.resetTag()
        done()
      }
    }
  },

  watch: {
    hideAdd () {
      if (this.hideAdd) {
        this.$emit('hide')
      } else {
        this.$emit('show')
      }
    }
  }
}
</script>
