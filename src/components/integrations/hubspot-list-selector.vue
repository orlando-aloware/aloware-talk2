<template>
  <q-select ref="hubspotListSelector"
            options-selected-class="text-primary"
            class="q-basic-selector"
            color="primary"
            option-value="id"
            option-label="name"
            input-debounce="0"
            style="word-break: break-all;"
            use-input
            emit-value
            map-options
            outlined
            dense
            v-model="value"
            :options="options"
            :placeholder="placeholder"
            :multiple="multiple"
            :disable="disable"
            :class="[ prepend ? 'with-prepend' : '', genericStyling ? 'generic-selector' : '', highlighted ? highlightedClass : '']"
            :use-chips="useChips"
            :clearable="clearable"
            :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
            :loading="isLoading"
            @popup-show="onShowMenu"
            @focus="onFocus"
            @blur="onBlur"
            @input="onInput"
            @filter="filterFn">
    <template v-slot:prepend
              v-if="prepend">
      <span class="text-size-xs text-grey-80">{{ prepend }}</span>
    </template>

    <template v-slot:no-option>
      <q-item>
        <q-item-section class="no-results text-grey">
          No results
        </q-item-section>
      </q-item>
    </template>

    <template v-slot:option="scope">
      <q-item v-if="!scope.opt.group"
              v-bind="scope.itemProps"
              v-on="scope.itemEvents">
        <q-item-section>
          <q-item-label>
            <q-item-label v-html="scope.opt.name" ></q-item-label>
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-item v-if="scope.opt.group"
              v-bind="scope.itemProps"
              v-on="scope.itemEvents">
        <q-item-label header
                      class="text-size-xs">
          {{ scope.opt.group }}
        </q-item-label>
      </q-item>
    </template>

    <template v-slot:selected-item="scope"
              v-if="useChips">
      <q-chip dense
              :tabindex="scope.tabindex"
              color="white"
              class="tag-selected-chip"
              text-color="secondary">
        <i class="fa fa-circle position-absolute"
            :style="`color: ${scope.opt.color}; font-size: 50%; left: 4px; top: 40%; margin-right: 10px;`"></i>
        <span class="ml-3 mr-3 pr-1 pl-1">{{ scope.opt.name }}</span>
        <div role="button"
              class="custom__remove d-flex align-items-center position-absolute r-0"
              @click="scope.removeAtIndex(scope.index)">
          <remove-tag-icon class="ml-1 remove-tag-icon"/>
        </div>
      </q-chip>
    </template>
  </q-select>
</template>

<script>
import { selectorMixin } from 'src/plugins/mixins'
import RemoveTagIcon from 'components/icons/contact-activity/remove-tag-icon'
import talk2Api from 'src/plugins/api/api'

export default {
  components: {
    RemoveTagIcon
  },

  mixins: [
    selectorMixin
  ],

  props: {
    useChips: {
      type: Boolean,
      default: false,
      required: false
    },
    value: {
      required: false
    },
    multiple: {
      type: Boolean,
      default: false,
      required: false
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
    genericStyling: {
      type: Boolean,
      default: true
    },
    highlighted: {
      type: Boolean,
      default: false
    },
    highlightedClass: {
      type: String,
      default: 'q-field--highlighted'
    },
    clearable: {
      type: Boolean,
      default: false,
      required: false
    },
    placeholder: {
      type: String,
      required: false
    }
  },
  datat () {
    return {
      options: [],
      isLoading: false
    }
  },
  methods: {
    getLists (offset = 0) {
      this.isLoading = true
      talk2Api.V1.integrations.hubspot.getList({
        params: {
          offset: offset
        }
      }).then(response => {
        const result = response.data
        this.lists.push(...result.lists)
        if (result.has_more) {
          return this.getLists(result.offset)
        } else {
          this.isLoading = false
        }
      }).catch((err) => {
        this.isLoading = false
        this.$handleErrors(err.response)
        console.log(err)
      })
    },
    filterFn (val, update) {
      if (val === '') {
        update(() => {
          this.options = this.sorted
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.options = this.sorted.filter((item) => item.name && item.name.toLowerCase().indexOf(needle) > -1)
      })
    }
  }
}
</script>
