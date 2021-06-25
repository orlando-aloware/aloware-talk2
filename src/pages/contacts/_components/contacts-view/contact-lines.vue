<template>
  <b-card class="mt-2 mb-2 border-0">
    <h6>Lines</h6>
    <div v-if="!is_edit">
      <b-badge variant="primary"
               class="badge-tag badge-tag-primary ellipsis"
               v-b-tooltip="line.name"
               v-for="line in appliedLines" :key="line.id">{{ line.name }}</b-badge>
    </div>

    <q-select
      v-if="is_edit"
      ref="contactLinesSelect"
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
      v-model="linesArray"
      :options="options"
      @filter="filterTagFn"
      @blur="onSelectBlur"
    >
      <template v-slot:selected-item="scope">
        <q-chip
          v-if="linesArray"
          removable
          dense
          square
          color="white"
          :tabindex="scope.tabindex"
          @remove="scope.removeAtIndex(scope.index)"
          v-b-tooltip="scope.opt.name"
        >
          <div :style="`color:#256EFF;margin-left:5px;max-width: 11vw;overflow: hidden;text-overflow: ellipsis;`">{{ scope.opt.name }}</div>
        </q-chip>
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
            v-on:click="onModifyLines">
      <i class="material-icons">edit</i> Modify Lines
    </b-link>
  </b-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import talk2Api from '../../../../plugins/api/api'
export default {
  name: 'contact-lines',
  computed: {
    ...mapGetters('contacts', ['contact', 'lines']),
    appliedLines () {
      return this.lines.filter(line => this.contact.campaign_ids.includes(line.id))
    }
  },
  data () {
    return {
      is_edit: false,
      linesArray: [],
      options: [],
      stringOptions: []
    }
  },
  methods: {
    ...mapActions('contacts', ['setLines', 'setContactLines']),
    onModifyLines () {
      this.is_edit = true
      this.$nextTick(function () {
        this.$refs.contactLinesSelect.focus()
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
    submitLines () {
      talk2Api.V1.contact.storeLines(this.contact.id, { campaign_ids: this.linesArray })
        .then(response => {
          this.setContactLines(this.linesArray)
        }).catch(err => {
          console.log(err)
          this.$root.handleErrors(err.response)
        })
    }
  },
  mounted () {
    talk2Api.V1.lines.get().then(response => {
      this.setLines(response.data)
      this.stringOptions = response.data
      this.options = this.stringOptions
    }).finally(() => {
      this.linesArray = this.contact.campaign_ids
    })
  },
  watch: {
    linesArray: function () {
      this.submitLines()
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
