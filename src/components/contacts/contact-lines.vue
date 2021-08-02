<template>
  <b-card class="border-0 contact-lines-wrapper">
    <h4>Lines</h4>
    <div v-if="!isEdit"
         class="mt-1">
      <b-badge variant="primary"
               class="badge-tag badge-tag-primary ellipsis"
               v-for="line in appliedLines"
               :key="line.id">
        <q-tooltip anchor="top middle"
                   self="center middle"
                   :offset="[20, 20]">
          {{ line.name }}
        </q-tooltip>
        {{ line.name }}
      </b-badge>
    </div>

    <vue-multiselect v-show="isEdit"
                     class="chip__clear-blue border-blue shrink-options options__no-border options__relative mt-2 options-list__tall"
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
            @click="onModifyLines">
      <pencil-o-icon></pencil-o-icon>
      Modify Lines
    </b-link>
  </b-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import PencilOIcon from 'src/components/icons/pencil-o-icon'
import VueMultiselect from 'vue-multiselect'
import { aclMixin } from 'src/plugins/mixins'

export default {
  name: 'contact-lines',

  mixins: [aclMixin],

  components: {
    PencilOIcon,
    VueMultiselect
  },

  computed: {
    ...mapGetters('contacts', ['contact', 'lines']),

    appliedLines () {
      return this.lines.filter(line => this.linesArray.includes(line.id))
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

  mounted () {
    if (this.contact && this.contact.id) {
      this.getLines()
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
      talk2Api.V1.contact.storeLines(this.contact.id, {
        campaign_ids: this.linesArray
      }).then(response => {
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
        this.linesArray = this.contact.campaign_ids || []
        this.selectedLines = this.options.filter(line => this.linesArray.includes(line.id))
      })
    }
  },

  watch: {
    'contact.id': function () {
      if (this.contact && this.contact.id) {
        this.getLines()
      }
    },

    selectedLines () {
      this.linesArray = this.selectedLines.map(line => line.id)
    }
  }
}
</script>
