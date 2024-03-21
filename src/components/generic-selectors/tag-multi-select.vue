<template>
  <div class="generic-multi-select">
    <h4 class="mb-1">
      {{ label | ucwords }}
    </h4>
    <q-field class="edit-wrapper mt-2 w-100"
             outlined
             stack-label
             v-if="isEdit"
             v-on:blur="handleBlur">
      <q-field class="w-100"
               outlined
               stack-label>
        <template v-slot:control>
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
                   :class="[typeof item.color !== 'undefined' ? 'ml-2' : '']">{{ item.name }}</div>
              <div role="button" class="custom__remove d-flex align-items-center"
                   @click="remove(item.id)">
                <remove-tag-icon class="ml-1 remove-tag-icon"/>
              </div>
            </div>
          </div>
          <q-input class="input-text-sm no-after-border w-100 mb-0 mt-1"
                   ref="search"
                   borderless
                   dense
                   input-class="input-text-sm"
                   placeholder="Type to search"
                   v-model.lazy="search">
          </q-input>
        </template>
      </q-field>
      <div :class="['dropdown-select scrollableArea mt-2 ml-2 mx-0', { 'w-100': !height }]"
           :style="height ? `height: ${height}px !important` : ''"
           v-if="searchList[0].children.length || searchList[1].children.length">
        <template v-if="!optionsIsGrouped">
          <div class="mr-1">
            <div role="button"
                 class="select-option w-100 d-flex justify-content-between p-2 align-items-center"
                 :key="item.id"
                 v-for="item in filteredOptions"
                 @click="onSelectOption(item.id)">
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
        </template>
        <template v-else>
          <div class="mr-1"
               :key="`title-${index}`"
               v-for="(item, index) in searchList">
            <div class="select-group w-100 d-flex justify-content-between py-2 align-items-center mb-1"
                 :class="[index !== 0 ? 'border-top' : '']">
              <span class="d-inline-flex align-items-center text-grey-100 w-100"
                    v-if="item.children.length">
                <span class="tag-text">{{ item.title }}</span>
              </span>
            </div>
            <div role="button"
                 class="select-option w-100 d-flex justify-content-between p-2 align-items-center"
                 :key="`child-${child.id}`"
                 v-for="child in item.children"
                 @click="onSelectOption(child.id)">
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
        </template>
      </div>
      <div class="text-center w-100"
           v-else>
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
           v-if="canEdit">
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
import _ from 'lodash'
import PencilOIcon from 'components/icons/pencil-o-icon'
import RemoveTagIcon from 'components/icons/contact-activity/remove-tag-icon'
import CheckOIcon from 'components/icons/check-o-icon'
import * as TagTypes from 'src/constants/tag-types'

export default {
  name: 'tag-multi-select',
  components: { CheckOIcon, PencilOIcon, RemoveTagIcon },
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
    }
  },

  data () {
    return {
      search: '',
      isEdit: false,
      loadingTags: false,
      selectedValues: [],
      searchList: [
        {
          title: 'Account Tags',
          children: []
        },
        {
          title: 'Import Tags',
          children: []
        }
      ]
    }
  },

  computed: {
    formattedValues () {
      return this.current
    },

    filteredOptions () {
      if (!this.loadingTags && (this.searchList[0].children.length || this.searchList[1].children.length)) {
        return this.searchList
      }
      this.getTags()
      return []
    }
  },

  mounted () {
    this.selectedValues = this.values
  },

  methods: {
    isSelected (id) {
      if (_.isEmpty(this.selectedValues)) {
        return false
      }

      return this.selectedValues.includes(id)
    },

    onSelectOption (id) {
      console.log('onSelectOption', id)
      if (this.isSelected(id)) {
        this.remove(id)
        return
      }
      this.selectedValues.push(id)
      console.log('onSelectOption this.selectedValues', this.selectedValues)
      this.$emit('valuesUpdated', this.selectedValues)
      this.$nextTick(() => {
        if (typeof this.$refs.search !== 'undefined') {
          this.$refs.search.focus()
        }
      })
      this.search = ''
    },

    handleBlur () {
      this.search = ''
      this.isEdit = false
    },

    onEdit () {
      this.isEdit = true
      this.searchList = [
        {
          title: 'Account Tags',
          children: []
        },
        {
          title: 'Import Tags',
          children: []
        }
      ]
      this.$nextTick(() => {
        this.$refs.search.focus()
      })
    },

    remove (id) {
      const found = { data: this.selectedValues.find(value => value === id) }
      found.data = found.data ? this.selectedValues.indexOf(found.data) : null
      if (found.data !== null && found.data !== -1) {
        this.selectedValues.splice(found.data, 1)
      }
      this.$emit('valuesUpdated', this.selectedValues)
    },

    getTags () {
      if (!this.search) {
        return
      }
      const params = {
        full_load: true,
        search: this.search
      }

      this.loadingTags = true

      this.$axios.get('/api/v1/tag', { params }).then(res => {
        const list = res.data
        const tags = list.filter(tag => tag.category === this.category)
        const accountTags = tags.filter(tag => tag.type === TagTypes.TYPE_COMPANY)
        const importTags = tags.filter(tag => tag.type === TagTypes.TYPE_IMPORT)

        this.searchList[0].children = accountTags
        this.searchList[1].children = importTags
        this.loadingTags = false
      }).catch(err => {
        console.log(err)
      })
    }
  },

  watch: {
    values: {
      deep: true,
      handler () {
        console.log('watch this.selectedValues', this.selectedValues)
        this.selectedValues = this.values
      }
    },
    search (newValue) {
      if (newValue && newValue.length >= this.threshold) {
        this.getTags()
      }
    }
  }
}
</script>
