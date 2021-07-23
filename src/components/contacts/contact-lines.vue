<template>
  <b-card class="border-0">
    <h6>Lines</h6>
    <div v-if="!isEdit">
      <b-badge variant="primary"
               class="badge-tag badge-tag-primary ellipsis"
               v-b-tooltip="line.name"
               v-for="line in appliedLines" :key="line.id">{{ line.name }}</b-badge>
    </div>

    <vue-multiselect v-show="isEdit"
                     class="chip__clear-blue border-blue shrink-options options__no-border options__relative"
                     track-by="id"
                     label="name"
                     ref="linesSelect"
                     placeholder="Select line"
                     openDirection="bottom"
                     :closeOnSelect="false"
                     :showLabels="false"
                     :multiple="true"
                     :options="options"
                     v-model="selectedLines"
                     @close="onSelectBlur">
    </vue-multiselect>

    <b-link v-if="!isEdit && hasRole('Company Admin')"
            href="#"
            class="custom-link text-decoration-none"
            v-on:click="onModifyLines">
      <pencil-o-icon></pencil-o-icon> Modify Lines
    </b-link>
  </b-card>
</template>

<script>
import _ from 'lodash'
import { mapActions, mapGetters } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import PencilOIcon from 'src/components/icons/pencil-o-icon'
import VueMultiselect from 'vue-multiselect'
import { aclMixin } from 'src/plugins/mixins'

export default {
  name: 'contact-lines',
  mixins: [aclMixin],
  components: { PencilOIcon, VueMultiselect },
  computed: {
    ...mapGetters('contacts', ['contact', 'lines']),
    appliedLines () {
      if (!_.isEmpty(this.lines) && !_.isEmpty(this.linesArray)) {
        return this.lines.filter(line => this.linesArray.includes(line.id))
      }
      return []
    }
  },
  data () {
    return {
      isEdit: false,
      linesArray: [],
      options: [],
      stringOptions: [],
      selectedLines: []
    }
  },
  methods: {
    ...mapActions('contacts', ['setLines', 'setContactLines']),
    onModifyLines () {
      this.isEdit = true
      this.$nextTick(function () {
        this.$refs.linesSelect.$el.focus()
      })
    },
    onSelectBlur () {
      this.isEdit = false
      this.submitLines()
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
    submitLines () {
      talk2Api.V1.contact.storeLines(this.contact.id, { campaign_ids: this.linesArray })
        .then(response => {
          this.setContactLines(this.linesArray)
        }).catch(err => {
          console.log(err)
          this.$root.handleErrors(err.response)
        })
    },
    getLines () {
      talk2Api.V1.lines.get().then(response => {
        this.setLines(response.data)
        this.stringOptions = response.data
        this.options = this.stringOptions
      }).finally(() => {
        this.linesArray = this.contact.campaign_ids
      })
    }
  },
  mounted () {
    if (!_.isEmpty(this.lines) && !_.isEmpty(this.contact)) {
      this.getLines()
    }
  },
  watch: {
    selectedLines: function () {
      this.linesArray = this.selectedLines.map(line => line.id)
    }
  }
}
</script>

<style lang="scss" scoped>
.card:hover {
  .btn-edit-action{
    opacity: 1;
  }
}

.btn-edit-action {
  right: 10px;
  top: 10px;
  opacity: 0;
}
</style>
