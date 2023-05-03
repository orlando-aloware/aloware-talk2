<template>
  <b-modal id="tag-form-modal"
           :title="title"
           no-close-on-esc
           no-close-on-backdrop
           v-model="openModal"
           @hidden="onHidden"
           @shown="onShow">
    <b-form ref="tagForm">
      <b-form-group class="font-weight-light text-13"
                    label="Name">
        <b-form-input v-model="tag.name"
                      placeholder="Enter tag name"
                      required />
      </b-form-group>

      <b-row>
        <b-col class="p-0"
               cols="2">
          <b-form-group class="font-weight-light text-13"
                        label="Color">
            <b-dropdown variant="light"
                        size="sm">
              <template #button-content>
                <i class="fa fa-square fa-2x" :style="{ color: tag.color }"></i>
              </template>

              <b-dropdown-item v-for="option in colorOptions"
                               :key="`color-${option}`"
                               @click="selectTagColor(option)">
                  <i class="fa fa-2x mx-1"
                     :class="[tag.color === option ? 'check-square' : 'fa-square']"
                     :style="{ color: option }">
                  </i>
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
                             v-model="tag.category"
                             @select="selectTagCategory"/>
          </b-form-group>
        </b-col>
      </b-row>

      <b-form-group class="font-weight-light text-13"
                    label="Description">
        <b-form-textarea id="textarea"
                         v-model="tag.description"
                         placeholder="Enter tag description"
                         rows="3"
                         max-rows="6"/>
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
              Add
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

    disabled: {
      type: Boolean,
      required: false,
      default: true
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
      ]
    }
  },

  mounted () {
    this.tag.category = this.selectedTagCategory
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
      return `Create a New ${this.tagCategoryName} Tag`
    }
  },

  methods: {
    onShow () {
      this.tag.category = this.selectedTagCategory
    },

    onHidden () {
      this.$emit('closeTagForm')
    },

    selectTagCategory (category) {
      this.tag.category = category
    },

    selectTagColor (color) {
      this.tag.color = color
    },

    closeTagForm () {
      this.$emit('closeTagForm')
    },

    saveTag () {
      // let url = '/api/v1/tag'

      // axios.post(url, tag)
      //   .then(res => {
      //     this.$emit('success', res.data)
      //     this.resetTag()
      //   })
      //   .catch(err => {
      //     this.$root.handleErrors(err.response)
      //     this.loading_btn = false
      //     this.resetTag()
      //   })
    }
  }
}
</script>
<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
