<template>
  <b-card class="mt-2 mb-2 border-0">
    <h6>Tags</h6>
    <div v-if="!is_edit">
      <b-badge v-for="tag in tags"
               variant="primary"
               class="badge-tag custom-badge-primary ellipsis"
               v-b-tooltip="tag.name"
               :key="tag.id" >
         <span :style="`color: ${tag.color};`"><i class="fa fa-circle" :style="`color: ${tag.color};font-size:50%;`"></i> {{ tag.name }}</span>
      </b-badge>
    </div>

    <q-select
      v-if="is_edit"
      ref="contactTagSelect"
      compact
      outlined
      use-chips
      use-input
      multiple
      input-debounce="0"
      behavior="menu"
      map-options
      emit-value
      option-value="id"
      option-label="name"
      style="width: 100%;"
      class="q-custom-select contact-tags-select"
      v-model="tagsArray"
      :options="options"
      @filter="filterTagFn"
      @blur="onSelectBlur"
    >
      <template v-slot:selected-item="scope">
        <q-chip
          v-if="tagsArray"
          removable
          dense
          square
          color="white"
          :tabindex="scope.tabindex"
          @remove="scope.removeAtIndex(scope.index)"
          v-b-tooltip="scope.opt.name"
        >
          <q-icon name='fa fa-circle' :style="`color:${scope.opt.color}; font-size:50%;width:10px;`" />
          <div :style="`color:${scope.opt.color};margin-left:5px;max-width: 11vw;overflow: hidden;text-overflow: ellipsis;`">{{ scope.opt.name }}</div>
        </q-chip>
      </template>
      <template v-slot:option="scope">
        <q-item
          v-bind="scope.itemProps"
          v-on="scope.itemEvents"
        >
          <q-item-section avatar>
            <q-icon name='fa fa-circle' :style="`color:${scope.opt.color}; font-size:50%`" />
          </q-item-section>
          <q-item-section>
            <q-item-label v-html="scope.opt.name" ></q-item-label>
          </q-item-section>
        </q-item>

      </template>
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey pl-3">
            No results
          </q-item-section>
        </q-item>
      </template>
    </q-select>

    <b-link v-if="!is_edit"
            href="#"
            class="custom-link text-decoration-none"
            v-on:click="onModifyTags">
      <i class="material-icons">edit</i> Modify Tags
    </b-link>
  </b-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import talk2Api from 'src/plugins/api/api'

export default {
  name: 'contact-tags',
  computed: {
    ...mapGetters('contacts', ['contact']),
    tags () {
      return this.contact.tags
    },
    getLabel () {
      return tag => {
        return `<q-icon name="fa fa-circle" :style="color:${tag.color}" /> ${tag.name}`
      }
    }
  },
  data () {
    return {
      is_edit: false,
      stringOptions: [],
      options: [],
      tagsArray: []
    }
  },
  mounted () {
    return talk2Api.V1.tags.get().then(response => {
      this.stringOptions = response.data
      this.options = this.stringOptions
    }).finally(() => {
      this.tagsArray = this.contact.tags.map(tag => tag.id)
    })
  },
  methods: {
    ...mapActions('contacts', ['setContactTags']),
    onModifyTags () {
      this.is_edit = true
      this.$nextTick(function () {
        this.$refs.contactTagSelect.focus()
      })
    },
    onSelectBlur () {
      this.is_edit = false
    },
    filterTagFn (val, update) {
      if (val === '') {
        update(() => {
          this.options = this.stringOptions
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.options = this.stringOptions.filter(v => v.name.toLowerCase().indexOf(needle) > -1)
      })
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
    tagsArray: function () {
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
</style>
