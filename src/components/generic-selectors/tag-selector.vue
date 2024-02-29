<template>
  <div>
    <generic-multi-select :label="label"
                          :buttonText="buttonText"
                          :values="selectedTags"
                          :options="optionsAlphabeticalOrder"
                          :canEdit="hasPermissionTo(['list tag', 'view tag'])"
                          v-if="genericMultiselect"
                          @valuesUpdated="select">
    </generic-multi-select>
    <q-select ref="tagSelect"
              options-selected-class="text-primary"
              color="primary"
              option-value="id"
              option-label="name"
              input-debounce="1000"
              style="word-break: break-all;"
              use-input
              emit-value
              map-options
              menu-shrink
              outlined
              dense
              :options="optionsAlphabeticalOrder"
              :placeholder="placeholder"
              :disable="disable"
              :class="[ prepend ? 'with-prepend' : '', highlighted ? highlightedClass : '']"
              :multiple="multiple"
              :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
              v-model="selectedTags"
              v-else
              @popup-show="onShowMenu"
              @filter="filterFn">

      <template v-slot:no-option>
        <q-item>
          <q-item-section class="no-results text-grey">
            No results
          </q-item-section>
        </q-item>
      </template>

      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps"
                v-on="scope.itemEvents">
          <q-item-section class="pl-2">
            <i class="fa fa-circle position-absolute"
               :style="`color: ${scope.opt.color}; font-size: 50%; left: 4px; top: 45%; margin-right: 10px;`"></i>
            <q-item-label class="ml-2" v-html="scope.opt.name"/>
          </q-item-section>
        </q-item>
      </template>

      <template v-slot:selected-item="scope">
        <q-chip dense
                :tabindex="scope.tabindex"
                color="white"
                class="tag-selected-chip"
                text-color="secondary">
          <i class="fa fa-circle position-absolute"
             :style="`color: ${scope.opt.color}; font-size: 50%; left: 4px; top: 40%; margin-right: 10px;`">
          </i>
          <span class="ml-3 mr-3 pr-1 pl-1">{{ scope.opt.name }}</span>
          <div role="button"
               class="custom__remove d-flex align-items-center position-absolute r-0"
               @click="scope.removeAtIndex(scope.index)">
            <remove-tag-icon class="ml-1 remove-tag-icon">
            </remove-tag-icon>
          </div>
        </q-chip>
      </template>
    </q-select>
  </div>
</template>

<script>
import talk2Api from 'src/plugins/api/api'
import { aclMixin } from 'src/plugins/mixins'
import GenericMultiSelect from 'components/generic-selectors/generic-multi-select'
import RemoveTagIcon from 'components/icons/contact-activity/remove-tag-icon'
import { mapState } from 'vuex'
import { TAG_CATEGORIES_VALUES as TagCategoriesValues } from 'src/constants/tag-categories'

export default {
  name: 'tags-selector',

  mixins: [aclMixin],

  components: { RemoveTagIcon, GenericMultiSelect },

  props: {

    value: {
      required: false
    },

    no_title: {
      type: Boolean,
      required: false,
      default: false
    },

    label: {
      type: String,
      default: 'Tags'
    },

    buttonText: {
      type: String,
      default: 'Modify Tags'
    },

    disable: {
      type: Boolean,
      default: false,
      required: false
    },

    prepend: {
      type: String,
      required: false
    },

    multiple: {
      type: Boolean,
      default: false,
      required: false
    },

    genericMultiselect: {
      type: Boolean,
      default: false
    },

    highlighted: {
      type: Boolean,
      default: false
    },

    highlightedClass: {
      type: String,
      default: 'q-field--highlighted'
    },

    category: {
      type: Number,
      default: null
    },

    threshold: {
      type: Number,
      default: 3
    }
  },

  computed: {
    ...mapState(['tags']),

    getLabel () {
      return tag => {
        return `<q-icon name="fa fa-circle" :style="color:${tag.color}" /> ${tag.name}`
      }
    },

    displayClass () {
      return !this.isEdit ? 'show-raw-value' : ''
    },

    placeholder () {
      switch (true) {
        case this.multiple && this.selectedTags.length < 1:
          return 'Type to search tags'
        case !this.multiple && !this.selectedTags:
          return 'Select Tag'
        case this.multiple && this.selectedTags.length > 0:
        case !this.multiple && this.selectedTags:
        default:
          return ''
      }
    },

    filteredOptions () {
      const tagsVariableName = this.genericMultiselect ? 'tags' : 'tagsOptions'

      if (!TagCategoriesValues.includes(this.category)) {
        return this[tagsVariableName]
      }

      return this[tagsVariableName].filter(tag => tag.category === this.category)
    },

    optionsAlphabeticalOrder () {
      return this.$alphabeticalSort(this.filteredOptions)
    }
  },

  data () {
    return {
      isEdit: false,
      tagsArray: [],
      tagsOptions: [],
      selectedTags: this.value,
      selectWidth: 0,
      preliminarTags: []
    }
  },

  methods: {
    onShowMenu () {
      this.selectWidth = this.$refs.tagSelect.$el.offsetWidth
    },

    filterFn (val, update) {
      this.getTags(val, update)
    },

    changeTags (event) {
      this.tagsArray = event
    },

    onSelectClose () {
      this.isEdit = false
    },

    onSelectOpen () {
      this.isEdit = true
    },

    getTags (search = '', update) {
      if (!this.hasPermissionTo('list tag')) {
        return
      }

      if (!search) {
        update(() => {
          this.tagsOptions = this.tagsArray
        })
        return
      }

      if (search.length >= this.threshold) {
        const params = {
          per_page: 100,
          filter: search
        }

        this.tagsOptions = []

        return talk2Api.V1.tags.get({
          params: params
        }).then(res => {
          update(() => {
            this.tagsArray = res.data
            this.tagsOptions = res.data
            // this.tags = res.data
            this.selectedTags = this.value
          })
        }).catch(err => {
          console.log(err)
        })
      }
    }
  },

  mounted () {
    if (Array.isArray(this.tags) && this.tags.length > 0) {
      this.tagsOptions = this.tags
      console.log('mounted this.tags', this.tags)
      console.log('mounted this.tagsOptions', this.tagsOptions)
    }
    console.log('mounted this.tags', this.tags)
    console.log('Type of this.tags:', typeof this.tags)
    console.log('mounted this.tagsOptions', this.tagsOptions)
    console.log('Type of this.tagsOptions:', typeof this.tagsOptions)
  },

  watch: {
    value () {
      this.selectedTags = this.value
      this.$refs.tagSelect.focus()

      setTimeout(() => {
        if (this.$refs.tagSelect) {
          this.$refs.tagSelect.blur()
          this.$refs.tagSelect.hidePopup()
        }
      }, 200)
    },

    selectedTags (val) {
      let matching = this.tagsOptions.filter(tag => val.includes(tag.id))
      this.preliminarTags = [...new Set([...this.preliminarTags, ...matching])]
      if (this.selectedTags !== this.value) {
        this.$emit('change', val)
        this.$emit('preliminar', this.preliminarTags)
      }
    }
  }
}
</script>
