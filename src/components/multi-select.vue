<template>
  <div>
    <multiselect v-if="multiple"
                 v-model="selected"
                 track-by="value"
                 label="label"
                 :multiple="true"
                 class="custom-multi-select custom-multi-select-multiple"
                 :placeholder="placeholder"
                 :options="options"
                 :searchable="true"
                 :showNoResults="false"
                 :close-on-select="false"
                 :show-labels="false"
                 tagPosition="bottom"
                 ref="multiselect"
                 :maxHeight="130"
                 @select="onSelect"
                 @remove="onRemove"
                 @close="closeEventHandler">
      <template slot="caret">
        <i class="fa fa-search search-icon"></i>
      </template>
      <template v-slot:option="option">
        <slot name="option-data" v-bind="option"></slot>
      </template>
    </multiselect>

    <multiselect v-else
                 v-model="selected"
                 :track-by="trackBy"
                 :label="label"
                 class="custom-multi-select custom-multi-select-single"
                 :placeholder="placeholder"
                 :options="options"
                 :searchable="true"
                 :showNoResults="false"
                 :close-on-select="false"
                 :show-labels="false"
                 tagPosition="bottom"
                 ref="multiselect"
                 :maxHeight="130"
                 :group-label="groupLabel"
                 :group-values="groupValues"
                 :group-select="groupSelect"
                 @select="onSelect"
                 @remove="onRemove"
                 @close="closeEventHandler">
      <template slot="caret">
        <i class="fa fa-search search-icon"></i>
      </template>
      <template v-slot:option="option">
        <slot name="option-data" v-bind="option"></slot>
      </template>
      <template v-slot:singleLabel="option">
        <slot name="selected-data" v-bind="option"></slot>
      </template>
    </multiselect>
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect'
export default {
  name: 'multi-select',
  components: { Multiselect },
  props: {
    options: {
      type: Array,
      required: true
    },
    placeholder: {
      type: String,
      default: 'Search',
      required: false
    },
    multiple: {
      type: Boolean,
      default: false,
      required: false
    },
    alwaysOpen: {
      type: Boolean,
      default: false,
      required: false
    },
    groupLabel: {
      type: String,
      default: '',
      required: false
    },
    groupValues: {
      type: String,
      default: '',
      required: false
    },
    groupSelect: {
      type: Boolean,
      default: false,
      required: false
    },
    trackBy: {
      type: String,
      required: false,
      default: ''
    },
    label: {
      type: String,
      required: false,
      default: ''
    }
  },
  data () {
    return {
      selected: null
    }
  },
  methods: {
    closeEventHandler () {
      if (this.alwaysOpen) {
        // this.$refs.multiselect.isOpen = true
      }
    },
    onSelect (selectedOption, id) {
      this.$el.querySelector('.custom-multi-select-single input.multiselect__input').placeholder = (selectedOption) || this.placeholder
    },
    onRemove () {
      this.$el.querySelector('.custom-multi-select-single input.multiselect__input').placeholder = this.placeholder
    }
  },
  mounted () {
    this.$refs.multiselect.isOpen = true
  }
}
</script>

<style src="../../node_modules/vue-multiselect/dist/vue-multiselect.min.css"></style>
<style>

.custom-multi-select-single i.search-icon {
  right: 14px;
  position: absolute;
  top: 12px;
}
</style>
