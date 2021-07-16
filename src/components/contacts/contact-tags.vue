<template>
  <b-card class="mt-2 mb-2 border-0">
    <h6>Tags</h6>
    <div v-if="!isEdit">
      <b-badge v-for="tag in tags"
               variant="primary"
               class="badge-tag custom-badge-primary ellipsis"
               v-b-tooltip="tag.name"
               :key="tag.id" >
         <span :style="`color: ${tag.color};`"><i class="fa fa-circle" :style="`color: ${tag.color};font-size:50%;position: relative; top: -2px;`"></i> {{ tag.name }}</span>
      </b-badge>
    </div>
    <tag-selector v-if="isEdit"
                  class="details-contact-tags"
                  ref="contactTagSelector"
                  v-model="selectedTagIds"
                  :displayLimit="100"
                  :multiple="true"
                  @change="changeTags($event)"
                  @close="onSelectBlur">
    </tag-selector>

    <b-link v-if="!isEdit && hasPermissionTo(['list tag', 'view tag'])"
            href="#"
            class="custom-link text-decoration-none"
            v-on:click="onModifyTags">
      <pencil-o-icon></pencil-o-icon> Modify Tags
    </b-link>
  </b-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import PencilOIcon from 'components/icons/pencil-o-icon'
import { aclMixin } from 'src/plugins/mixins'
import TagSelector from 'components/tag-selector'

export default {
  name: 'contact-tags',
  mixins: [aclMixin],
  components: { TagSelector, PencilOIcon },
  computed: {
    ...mapGetters('contacts', ['contact']),
    tags () {
      return this.contact.tags
    },
    getLabel () {
      return tag => {
        return `<q-icon name="fa fa-circle" :style="color:${tag.color}" /> ${tag.name}`
      }
    },
    selectedTagIds () {
      return this.tags.map(tag => tag.id)
    }
  },
  data () {
    return {
      isEdit: false,
      tagsArray: []
    }
  },
  methods: {
    ...mapActions('contacts', ['setContactTags']),
    changeTags (event) {
      this.tagsArray = event
    },
    onModifyTags () {
      this.isEdit = true
      this.$nextTick(function () {
        this.$refs.contactTagSelector.$el.focus()
      })
    },
    onSelectBlur () {
      this.isEdit = false
    },

    submitTags () {
      talk2Api.V1.contact.storeTags(this.contact.id, { tags: this.tagsArray })
        .then(response => {
          this.setContactTags(response.data)
        }).catch(err => {
          console.log(err)
          this.$root.handleErrors(err.response)
        })
    }
  },
  watch: {
    'tagsArray': function () {
      this.submitTags()
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
@import 'src/css/breakpoints.scss';
  .badge-tag {
    background: transparent;
    font-weight: 500;
    border: 1px solid #dee2e6;
    margin-right: 5px;
    font-size: 0.80em;
  }

  .custom-badge-primary {
    color: $blue;
  }

  .custom-badge-secondary {
    color: $grey-mid;
  }

  .custom-badge-success {
    color: #28a745;
  }

  .custom-badge-danger {
    color: #dc3545;
  }

  .custom-badge-warning {
    color: #ffc107;
  }

  .custom-badge-info {
    color: #17a2b8;
  }
  .custom-badge-light {
    color: #f8f9fa;
  }
  .custom-badge-dark {
    color: #343a40;
  }

  .btn-edit-action {
    right: 10px;
    top: 10px;
  }

  .tags-form-popover {
    left: -280px !important;
  }

  .q-tags-menu {
    width: 300px !important;
  }

  .contact-tags-select {
    .q-field--outlined .q-field__control:before{
      border: 1px solid #256EFF !important;
    }
  }

  .option-icon-wrapper {
    position: absolute;
    top: 40%;
  }

   .multiselect span.option__title {
    margin-left: 15px;
  }

   .multiselect {
     .tag-text {
       width: 20px;
     }
   }
</style>
