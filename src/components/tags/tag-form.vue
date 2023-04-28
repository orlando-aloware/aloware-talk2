<template>
  <b-modal id="tag-form-modal"
           :title="title"
           v-model="openModal"
           @hidden="onHidden">
    <div class="modal-body-wrapper d-flex">
      <b-form-input placeholder="Enter your name"></b-form-input>
    </div>
  </b-modal>
</template>

<script>
import { tagsMixin } from 'src/plugins/mixins'

export default {
  name: 'tag-form',

  props: {
    isShow: {
      type: Boolean,
      required: true
    }
  },

  mixins: [
    tagsMixin
  ],

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
    onHidden () {
      this.$emit('closeTagForm')
    }
  }
}
</script>
