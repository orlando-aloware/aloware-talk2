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
          <div v-for="item in formattedValues"
               :key="item.id"
               class="w-100 text-break">
            <div class="border border-half-rounded d-inline-flex align-items-stretch mr-1 mb-1 tag-items">
              <div class="dot-wrapper d-flex align-items-center position-absolute">
                <q-badge class="is-dot mx-1"
                         rounded
                         :style="{ background: item.color }"
                         v-if="typeof item.color !== 'undefined'">
                </q-badge>
              </div>
              <div class="tag-text ml-3">{{ item.name }}</div>
              <div role="button" class="custom__remove d-flex align-items-center"
                    @click="remove(item.id)">
                <remove-tag-icon class="ml-1 remove-tag-icon">
                </remove-tag-icon>
              </div>
            </div>
          </div>
          <q-input class="input-text-sm no-after-border w-100 mb-0 mt-1"
                   ref="search"
                   borderless
                   dense
                   v-model="search"
                   input-class="input-text-sm"
                   placeholder="Type to search">
          </q-input>
        </template>
      </q-field>
      <div class="dropdown-select scrollableArea mt-2 ml-2 mx-0 w-100" v-if="options.length">
        <template v-if="!optionsIsGrouped">
          <div class="mr-1">
            <div role="button"
                 class="select-option w-100 d-flex justify-content-between p-2 align-items-center"
                 v-for="item in filteredOptions"
                 :key="item.id"
                 @click="onSelectOption(item.id)">
              <span :style="{ color: (typeof item.color !== 'undefined' ? item.color : null) }"
                    class="d-inline-flex align-items-start mr-1 mb-1 tag-items text-break position-relative">
                <q-badge class="is-dot mx-1 position-absolute"
                         rounded
                         :style="{ background: item.color }"
                         v-if="typeof item.color !== 'undefined'">
                </q-badge>
                <span class="tag-text text-grey-100 ml-2">{{ item.name }}</span>
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
          <div v-for="(item, index) in filteredOptions"
               :key="`title-${index}`"
               class="mr-1">
            <div class="select-group w-100 d-flex justify-content-between py-2 align-items-center mb-1"
                 :class="[index !== 0 ? 'border-top' : '']">
              <span class="d-inline-flex align-items-center text-grey-100 w-100">
                <span class="tag-text">{{ item.title }}</span>
              </span>
            </div>
            <div role="button"
                 class="select-option w-100 d-flex justify-content-between p-2 align-items-center"
                 v-for="child in item.children"
                 :key="`child-${child.id}`"
                 @click="onSelectOption(child.id)">
              <span class="d-inline-flex align-items-start mr-1 mb-1 tag-items text-break position-relative"
                    v-if="typeof child.color !== 'undefined'">
                <q-badge class="is-dot mx-1 position-absolute"
                         rounded
                         :style="{ background: child.color }"
                         v-if="typeof child.color !== 'undefined'">
                </q-badge>
                <span class="tag-text text-grey-100 ml-2">{{ child.name }}</span>
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
             v-for="item in formattedValues"
             :key="item.id">
        <span class="border border-half-rounded d-inline-flex align-items-start mr-1 mb-1 tag-items text-break position-relative">
          <q-badge class="is-dot mx-1"
                   rounded
                   :style="{ background: item.color }"
                   v-if="typeof item.color !== 'undefined'">
          </q-badge>
          <span class="tag-text ml-3">{{ item.name }}</span>
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
import PencilOIcon from 'components/icons/pencil-o-icon'
import RemoveTagIcon from 'components/icons/contact-activity/remove-tag-icon'
import CheckOIcon from 'components/icons/check-o-icon'
export default {
  name: 'generic-multi-select',
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
    canEdit: {
      required: false,
      type: Boolean,
      default: true
    },
    optionsIsGrouped: {
      required: false,
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      search: '',
      isEdit: false,
      selectedValues: []
    }
  },
  computed: {
    allOptions () {
      if (!this.optionsIsGrouped) {
        return this.options
      }
      let newOptions = []
      for (let item of this.options) {
        newOptions = newOptions.concat(item.children)
      }
      return newOptions
    },
    formattedValues () {
      let newValues = []
      for (let item of this.selectedValues) {
        let found = this.allOptions.find(option => option.id === item)
        if (found) {
          newValues.push(found)
        }
      }
      return newValues
    },
    filteredOptions () {
      if (!this.optionsIsGrouped) {
        return this.options.filter(item => item.name.toLowerCase().includes(this.search.toLocaleLowerCase()))
      }
      let newOptions = []
      for (let item of this.options) {
        newOptions.push({
          title: item.title,
          children: item.children.filter(item => item.name.toLowerCase().includes(this.search.toLocaleLowerCase()))
        })
      }
      return newOptions
    }
  },
  mounted () {
    this.selectedValues = this.values
  },
  methods: {
    isSelected (id) {
      return this.selectedValues.includes(id)
    },
    onSelectOption (id) {
      if (this.isSelected(id)) {
        this.remove(id)
        return
      }
      this.selectedValues.push(id)
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
      this.$nextTick(() => {
        this.$refs.search.focus()
      })
    },
    remove (id) {
      let found = this.selectedValues.find(value => value === id)
      let index = found ? this.selectedValues.indexOf(found) : null
      if (index !== null && index !== -1) {
        this.selectedValues.splice(index, 1)
      }
      this.$emit('valuesUpdated', this.selectedValues)
    }
  },
  watch: {
    values: {
      deep: true,
      handler () {
        this.selectedValues = this.values
      }
    }
  }
}
</script>
