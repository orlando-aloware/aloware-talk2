<template>
    <generic-multi-select :label="label"
                          :buttonText="buttonText"
                          :values="tagIds"
                          :options="tags"
                          :canEdit="hasPermissionTo(['list tag', 'view tag'])"
                          v-if="genericMultiselect"
                          @valuesUpdated="select">
    </generic-multi-select>
  <q-select v-else
            :options="tags"
            :placeholder="placeholder"
            :disable="disable"
            class="multiselect always-open"
            :class="[ prepend ? 'with-prepend' : '' ]"
            v-model="tagId"
            :multiple="multiple"
            use-chips
            options-selected-class="text-primary"
            color="primary"
            option-value="id"
            option-label="name"
            input-debounce="0"
            use-input
            emit-value
            map-options
            outlined
            dense>

    <template v-slot:no-option>
      <q-item>
        <q-item-section class="no-results text-grey">
          No results
        </q-item-section>
      </q-item>
    </template>

  </q-select>
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
    placeholder: {
      type: String,
      default: 'Select Tags'
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
    }
  },

  data () {
    return {
      isEdit: false,
      tagsArray: [],
      tags: [],
      tagId: []
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
    }
  },

  mounted () {
    this.getTags()
  },

  methods: {
    changeTags (event) {
      this.tagsArray = event
    },

    onModifyTags () {
      this.isEdit = true
      this.$nextTick(function () {
        this.$refs.contactTagSelector.$el.focus()
      })
    },

    onSelectClose () {
      this.isEdit = false
    },

    onSelectOpen () {
      this.isEdit = true
    },

    onRemoveTag () {
      this.isEdit = true
    },

    getTags () {
      if (!this.hasPermissionTo('list tag')) {
        return
      }

      return talk2Api.V1.tags.get({
        params: { full_load: true }
      }).then(res => {
        this.tags = res.data
      }).catch(err => {
        console.log(err)
      })
    }
  },
  watch: {
    value () {
      this.tagId = this.value
    },
    tagId (val) {
      if (this.tagId !== this.value) {
        this.$emit('change', val)
      }
    }
  }
}
</script>
