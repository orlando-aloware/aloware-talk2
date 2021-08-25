<template>
  <div>
    <generic-multi-select :label="label"
                          :buttonText="buttonText"
                          :values="tags"
                          :options="tagsOptions"
                          :canEdit="hasPermissionTo(['list tag', 'view tag'])"
                          v-if="genericMultiselect"
                          @valuesUpdated="select">
    </generic-multi-select>
    <q-select v-else
              ref="tagSelect"
              use-chips
              options-selected-class="text-primary"
              color="primary"
              option-value="id"
              option-label="name"
              input-debounce="0"
              style="word-break: break-all;"
              use-input
              emit-value
              map-options
              menu-shrink
              outlined
              dense
              v-model="tags"
              :options="tagsOptions"
              :placeholder="placeholder"
              :disable="disable"
              :class="[ prepend ? 'with-prepend' : '', highlighted ? highlightedClass : '']"
              :multiple="multiple"
              :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
              @popup-show="onShowMenu"
              @filter="filterFn">

      <template v-slot:no-option>
        <q-item>
          <q-item-section class="no-results text-grey">
            No results
          </q-item-section>
        </q-item>
      </template>
<!--      <template v-slot:option="scope">-->
<!--        <q-item v-bind="scope.itemProps">-->
<!--          <q-item-section>dsfdsf-->
<!--            <q-item-label v-html="scope.opt.name" />-->
<!--          </q-item-section>-->
<!--        </q-item>-->
<!--      </template>-->
    </q-select>
  </div>
</template>

<script>
import talk2Api from 'src/plugins/api/api'
import { aclMixin } from 'src/plugins/mixins'
import GenericMultiSelect from 'components/generic-selectors/generic-multi-select'

export default {
  name: 'tags-selector',

  mixins: [aclMixin],

  components: { GenericMultiSelect },

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
    }
  },

  computed: {
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
        case this.multiple && this.tags.length < 1:
          return 'Select Tags'
        case !this.multiple && !this.tags:
          return 'Select Tag'
        case this.multiple && this.tags.length > 0:
        case !this.multiple && this.tags:
        default:
          return ''
      }
    }
  },

  data () {
    return {
      isEdit: false,
      tagsArray: [],
      tagsOptions: [],
      tags: this.value,
      selectWidth: 0
    }
  },

  methods: {
    onShowMenu () {
      this.selectWidth = this.$refs.tagSelect.$el.offsetWidth
    },

    filterFn (val, update) {
      if (val === '') {
        update(() => {
          this.tagsOptions = this.tagsArray
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.tagsOptions = this.tagsArray.filter(campaign => campaign.name.toLowerCase().indexOf(needle) > -1)
      })
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

    getTags () {
      if (!this.hasPermissionTo('list tag')) {
        return
      }

      return talk2Api.V1.tags.get({
        params: { full_load: true }
      }).then(res => {
        this.tagsArray = res.data
      }).catch(err => {
        console.log(err)
      })
    }
  },

  mounted () {
    this.getTags()
  },

  watch: {
    value () {
      this.tags = this.value
    },
    tags (val) {
      if (this.tags !== this.value) {
        this.$emit('change', val)
      }
    }
  }
}
</script>
