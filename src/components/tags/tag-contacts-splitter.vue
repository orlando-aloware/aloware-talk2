<template>
  <b-modal id="tag-contacts-splitter-modal"
           modal-class="tags__modal"
           no-close-on-esc
           no-close-on-backdrop
           size="sm"
           v-model="openModal"
           @hidden="closeModal">
    <b-overlay class="h-100 w-100 position-absolute"
               rounded="sm"
               :show="true"
               v-show="loading">
      <template #overlay>
        <q-spinner-bars color="primary"
                        size="40px" />
      </template>
    </b-overlay>

    <template #modal-title>
      <h6>Spit Tag</h6>
    </template>

    <p>
      Split <span class="font-italic font-weight-bold">{{ tagName }}</span> tag into smaller tags.
    </p>
    <p v-show="!allowSplit"
       class="text-red text-11 mb-0">
      Contact count is less than or equal to page size.
    </p>
    <vue-multiselect track-by="value"
                     label="label"
                     class="mr-1 chip__clear-blue shrink-options"
                     placeholder="Select page size"
                     :searchable="true"
                     :showNoResults="false"
                     :close-on-select="true"
                     :options="options"
                     :show-labels="false"
                     :allow-empty="false"
                     v-model="selectetdPageSize"
                     @select="setSplitPageSize"/>
    <template #modal-footer>
      <div class="mt-2 d-flex w-100">
        <div class="ml-auto">
          <button class="btn btn-sm btn-outline-dark mr-2"
                  @click.prevent="closeModal">
            Cancel
          </button>
          <button class="btn btn-sm btn-primary text-white"
                  :disabled="!allowSplit"
                  @click.prevent="splitTag">
            Split
          </button>
        </div>
      </div>
    </template>
  </b-modal>
</template>

<script>
import { tagsMixin } from 'src/plugins/mixins'
import VueMultiselect from 'vue-multiselect'
import axios from 'axios'

export default {
  name: 'tag-contacts-splitter',

  components: {
    VueMultiselect
  },

  mixins: [
    tagsMixin
  ],

  props: {
    tag: {
      type: Object,
      required: false
    },

    isShow: {
      type: Boolean,
      required: true
    }
  },

  data () {
    return {
      loading: false,
      options: [
        {
          value: 50,
          label: '50'
        },
        {
          value: 100,
          label: '100'
        },
        {
          value: 200,
          label: '200'
        },
        {
          value: 500,
          label: '500'
        },
        {
          value: 1000,
          label: '1000'
        }
      ],
      splitPageSize: null,
      selectetdPageSize: null
    }
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

    tagName () {
      return this?.tag?.name || ''
    },

    allowSplit () {
      if (!this.tag) {
        return false
      }

      return this.tag.contacts_count > this.splitPageSize
    }
  },

  methods: {
    closeModal () {
      this.splitPageSize = null
      this.selectetdPageSize = null
      this.$emit('closeAssignContactsTagModal')
    },

    setSplitPageSize () {
      this.splitPageSize = this.selectetdPageSize.value
    },

    splitTag () {
      if (!this.allowSplit) {
        return
      }

      axios.post('/api/v1/tags/' + this.tag.id + '/split', {
        page_size: this.splitPageSize
      }).then(res => {
        switch (res.status) {
          case 200:
            this.$generalNotification('Currently splitting the tag into smaller tags.')
            break
          default:
            this.$generalNotification(res.data.message, 'error')
        }
      })
        .catch(err => {
          console.log(err)
          this.$handleErrors(err.response)
          this.loading = false
        })
    }
  }
}
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
