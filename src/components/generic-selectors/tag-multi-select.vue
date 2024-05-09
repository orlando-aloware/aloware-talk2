<template>
  <div class="generic-multi-select">
    <h4 class="mb-1">
      {{ label | ucwords }}
    </h4>
    <q-field class="edit-wrapper mt-2 w-100"
             outlined
             stack-label
             :dense="dense"
             v-if="isEdit || isFilter"
             @focus="onEdit"
             @blur="handleBlur">
      <q-field class="w-100"
               outlined
               stack-label
               :dense="dense">
        <template v-slot:control>
          <div :class="{ 'with-value': dense && formattedValues?.length }">
            <div class="w-100 text-break"
                 :key="item.id"
                 v-for="item in formattedValues">
              <div class="border border-half-rounded d-inline-flex align-items-stretch mr-1 mb-1 tag-items">
                <div class="dot-wrapper d-flex align-items-center position-absolute">
                  <q-badge class="is-dot"
                           rounded
                           :style="{ background: item.color }"
                           v-if="typeof item.color !== 'undefined'">
                  </q-badge>
                </div>
                <div class="tag-text"
                     :class="[typeof item.color !== 'undefined' ? 'ml-2' : '']">
                  {{ item.name }}
                </div>
                <div role="button" class="custom__remove d-flex align-items-center"
                     @click="remove(item.id)">
                  <remove-tag-icon class="ml-1 remove-tag-icon"/>
                </div>
              </div>
            </div>
          </div>

          <q-input class="input-text-sm no-after-border w-100 mb-0 mt-1"
                   ref="search"
                   borderless
                   input-class="input-text-sm"
                   :placeholder="inputPlaceholder"
                   :debounce="1100"
                   :dense="dense"
                   v-model="search">
          </q-input>
        </template>

        <template v-slot:append>
          <q-icon class="q-select__dropdown-icon q-icon notranslate cursor-pointer"
                  name="expand_less"
                  v-if="isEdit"/>
          <q-icon class="q-select__dropdown-icon q-icon notranslate cursor-pointer"
                  name="expand_more"
                  v-else/>
        </template>

        <template v-slot:hint>
          <div class="q-field__bottom row items-start q-field__bottom--animated">
            <div class="q-field__messages col">
              <div>Type at least 3 characters</div>
            </div>
          </div>
        </template>
      </q-field>
      <div class="dropdown-select scrollableArea mt-2 ml-2 mx-0 w-100"
           :style="height ? `height: ${height}px !important` : ''"
           v-if="shouldShowList">
        <div v-if="!optionsIsGrouped">
          <q-infinite-scroll ref="infiniteScroll"
                             scroll-target=".scrollableArea"
                             :offset="100"
                             :initial-index="1"
                             v-if="isEdit"
                             @load="getTags">
            <div class="mr-1"
                 :class="{ 'hidden': isEmptyData || !isEdit }">
              <div role="button"
                   class="select-option w-100 d-flex justify-content-between p-2 align-items-center"
                   :key="item.id"
                   v-for="item in filteredOptions"
                   @click="onSelectOption(item)">
                <span :style="{ color: (typeof item.color !== 'undefined' ? item.color : null) }"
                      class="d-inline-flex align-items-start mr-1 mb-1 tag-items text-break position-relative">
                  <q-badge class="is-dot ml-2 mr-1 pr-1 position-absolute"
                           rounded
                           :style="{ background: item.color }"
                           v-if="typeof item.color !== 'undefined'">
                  </q-badge>
                  <span class="tag-text text-grey-100">{{ item.name }}</span>
                </span>
                <div>
                  <check-o-icon color="#256EFF"
                                width="12"
                                height="8"
                                v-if="isSelected(item.id)"/>
                </div>
              </div>
            </div>
          </q-infinite-scroll>
          <div class="text-center w-100"
               v-if="search.length && !searchList[0].children.length && !searchList[1].children.length && !loadingTags">
            <span>No options to select</span>
          </div>
          <div class="row justify-center q-my-md"
               v-else-if="loadingTags">
            <q-spinner-dots color="primary"
                            size="20px" />
          </div>
        </div>
        <div v-else>
          <q-infinite-scroll ref="infiniteScroll"
                             scroll-target=".scrollableArea"
                             :offset="100"
                             :initial-index="1"
                             v-if="isEdit"
                             @load="getTags">
            <div class="mr-1"
                 :class="{ 'hidden': isEmptyData || !isEdit }"
                 :key="`title-${index}`"
                 v-for="(item, index) in searchList">
              <div class="select-group w-100 d-flex justify-content-between py-2 align-items-center mb-1"
                   :class="[index !== 0 && item.children?.length ? 'border-top' : '']">
                <span class="d-inline-flex align-items-center text-grey-100 w-100"
                      v-if="item.children.length">
                  <span class="tag-text">{{ item.title }}</span>
                </span>
              </div>
              <div role="button"
                   class="select-option w-100 d-flex justify-content-between p-2 align-items-center"
                   :key="`child-${child.id}`"
                   v-for="child in item.children"
                   @click="onSelectOption(child)">
                <span class="d-inline-flex align-items-start mr-1 mb-1 tag-items text-break position-relative"
                      v-if="typeof child.color !== 'undefined'">
                  <q-badge class="is-dot ml-2 mr-1 pr-1 position-absolute"
                           rounded
                           :style="{ background: child.color }"
                           v-if="typeof child.color !== 'undefined'">
                  </q-badge>
                  <span class="tag-text text-grey-100">{{ child.name }}</span>
                </span>
                <check-o-icon color="#256EFF"
                              width="12"
                              height="8"
                              v-if="isSelected(child.id)"/>
              </div>
            </div>
          </q-infinite-scroll>
          <div class="text-center w-100"
               v-if="search.length && !searchList[0].children.length && !searchList[1].children.length && !loadingTags">
            <span>No options to select</span>
          </div>
          <div class="row justify-center q-my-md"
               v-else-if="loadingTags">
            <q-spinner-dots color="primary"
                            size="20px" />
          </div>
        </div>
      </div>
      <div class="text-center w-100"
           v-else-if="!isFilter">
        <span>No options to select</span>
      </div>
    </q-field>
    <div class="list-wrapper"
         v-else>
      <div class="selected-items-wrapper">
        <div class="d-inline-block"
             :key="item.id"
             v-for="item in formattedValues">
          <span class="border border-half-rounded d-inline-flex align-items-start mr-1 mb-1 tag-items text-break position-relative">
            <q-badge class="is-dot"
                     rounded
                     :style="{ background: item.color }"
                     v-if="typeof item.color !== 'undefined'">
            </q-badge>
            <span class="tag-text"
                  :class="[typeof item.color !== 'undefined' ? 'ml-2' : '']">{{ item.name }}</span>
          </span>
        </div>
      </div>
      <div class="w-100 mt-1"
           v-if="canEdit && !isFilter">
        <b-link href="#"
                class="custom-link text-decoration-none btn-tag-edit d-flex align-items-center"
                @click="onEdit">
          <slot name="button">
            <pencil-o-icon/>
            <span class="ml-1">
              {{ buttonText | ucwords }}
            </span>
          </slot>
        </b-link>
      </div>
    </div>
  </div>
</template>

<script>
import { isEmpty, sortBy, union } from 'lodash'
import PencilOIcon from 'components/icons/pencil-o-icon'
import RemoveTagIcon from 'components/icons/contact-activity/remove-tag-icon'
import CheckOIcon from 'components/icons/check-o-icon'
import * as TagTypes from 'src/constants/tag-types'

export default {
  name: 'tag-multi-select',
  components: {
    CheckOIcon,
    PencilOIcon,
    RemoveTagIcon
  },
  props: {
    label: {
      required: false,
      type: String,
      default: ''
    },

    buttonText: {
      required: false,
      type: String,
      default: ''
    },

    values: {
      required: false,
      type: Array,
      default: () => []
    },

    options: {
      required: true,
      type: Array,
      default: () => []
    },

    current: {
      required: false,
      type: Array,
      default: () => []
    },

    canEdit: {
      required: false,
      type: Boolean,
      default: true
    },

    optionsIsGrouped: {
      required: false,
      type: Boolean,
      default: false
    },

    height: {
      required: false,
      type: Number
    },

    threshold: {
      type: Number,
      default: 3,
      required: false
    },

    category: {
      required: true,
      type: Number
    },

    isFilter: {
      required: false,
      type: Boolean,
      default: false
    },

    dense: {
      required: false,
      type: Boolean,
      default: false
    },

    placeholder: {
      required: false,
      type: String,
      default: ''
    }
  },

  data () {
    return {
      search: '',
      isEdit: false,
      loadingTags: false,
      selectedValues: [],
      selectedValuesObjects: [],
      searchList: [
        {
          title: 'Account Tags',
          children: []
        },
        {
          title: 'Import Tags',
          children: []
        }
      ],
      page: 1,
      hasMorePages: true
    }
  },

  computed: {
    formattedValues () {
      if (this.isEmptyData) {
        return this.current || []
      }

      return this.selectedValuesObjects
    },

    filteredOptions () {
      if (!this.loadingTags && (this.searchList[0].children.length || this.searchList[1].children.length)) {
        return this.searchList
      }
      this.getTags()
      return []
    },

    isEmptyData () {
      return !this.searchList[0].children.length && !this.searchList[1].children.length
    },

    shouldShowList () {
      return this.isEdit
    },

    inputPlaceholder () {
      if (this.placeholder) {
        return this.placeholder
      }

      return this.isFilter ? 'Type at least 3 characters' : 'Type to search'
    }
  },

  mounted () {
    this.selectedValues = this.values
  },

  methods: {
    isSelected (id) {
      if (isEmpty(this.selectedValues)) {
        return false
      }

      return this.selectedValues.includes(id)
    },

    onSelectOption (item) {
      const selectedValues = this.selectedValues?.length ? [...this.selectedValues, item?.id] : [item?.id]

      if (this.isSelected(item?.id)) {
        this.remove(item?.id)
        return
      }

      if (!this.isFilter) {
        this.selectedValues.push(item?.id)
      }

      this.selectedValuesObjects.push(item)
      this.$emit('values-updated', selectedValues, this.selectedValuesObjects)
      this.$nextTick(() => {
        if (typeof this.$refs.search !== 'undefined') {
          this.$refs.search.focus()
        }
      })
    },

    handleBlur () {
      this.isEdit = false
    },

    onEdit () {
      this.isEdit = true

      if (!this.isEmptyData) {
        return
      }

      this.$nextTick(() => {
        this.$refs.search.focus()
        this.$refs.infiniteScroll.trigger()
      })
    },

    remove (id) {
      const found = { data: this.selectedValues.find(value => value === id) }
      found.data = found.data ? this.selectedValues.indexOf(found.data) : null
      if (found.data !== null && found.data !== -1) {
        this.selectedValues.splice(found.data, 1)
      }

      this.selectedValuesObjects = this.selectedValuesObjects.filter(tag => tag.id !== id)
      this.$emit('values-updated', this.selectedValues, this.selectedValuesObjects)
    },

    filterByTagType (tags, tagType) {
      return tags
        .filter(tag => tag.type === tagType)
        .map(tag => ({
          id: tag.id,
          name: tag.name,
          color: tag.color
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
    },

    mergeWithoutDuplicatingAndSortAlphabetically (array1, array2) {
      return array1.concat(array2).filter((item, index, self) => index === self.findIndex(t => t.id === item.id)).sort((a, b) => a.name.localeCompare(b.name))
    },

    getTags (page, done) {
      if (!this.hasMorePages) {
        return
      }

      const params = {
        per_page: 50,
        search: this.search,
        page: this.page,
        category: this.category,
        order_by: 'name',
        order: 'asc'
      }

      this.loadingTags = true

      this.$axios.get('/api/v1/tag', { params }).then(res => {
        const tags = res.data?.data
        const accountTags = this.filterByTagType(tags, TagTypes.TYPE_COMPANY)
        const importTags = this.filterByTagType(tags, TagTypes.TYPE_IMPORT)

        this.searchList[0].children = sortBy(union(this.searchList[0].children, accountTags))
        this.searchList[1].children = sortBy(union(this.searchList[1].children, importTags))

        this.page++
        this.hasMorePages = res.data.current_page < res.data.last_page

        if (this.hasMorePages) {
          done && done()
        }
      }).catch(err => {
        console.error(err)
      }).finally(() => {
        this.loadingTags = false
      })
    },

    resetInfiniteScroll () {
      this.isEdit = false

      this.$nextTick(() => {
        this.isEdit = true

        this.$nextTick(() => {
          this.$refs.search.focus()
          this.$refs.infiniteScroll.reset(0)
          this.$refs.infiniteScroll.trigger()
        })
      })
    },

    resetTags () {
      this.page = 1
      this.hasMorePages = true
      this.searchList[0].children = []
      this.searchList[1].children = []
      this.resetInfiniteScroll()
    }
  },

  watch: {
    values: {
      deep: true,
      handler () {
        this.selectedValues = this.values
      }
    },
    current: {
      deep: true,
      handler () {
        this.selectedValuesObjects = this.current
      },
      immediate: true
    },
    search: function (newValue) {
      if ((newValue && newValue.length >= this.threshold) || !newValue.length) {
        this.resetTags()
      }
    }
  }
}
</script>
