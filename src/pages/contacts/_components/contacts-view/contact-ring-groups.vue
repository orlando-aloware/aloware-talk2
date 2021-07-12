<template>
  <b-card class="mt-2 mb-2 border-0">
    <h6>Contact Ring Groups</h6>
    <div v-if="!is_edit">
      <b-badge variant="primary"
               class="badge-tag badge-tag-primary ellipsis"
               v-for="ringGroup in appliedRingGroups"
               v-b-tooltip="ringGroup.name"
               :key="ringGroup.id">{{ ringGroup.name }}</b-badge>
    </div>
    <q-select
      v-if="is_edit"
      ref="contactRingGroupsSelect"
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
      v-model="ringGroupsArray"
      :options="options"
      @filter="filterTagFn"
      @blur="onSelectBlur"
    >
      <template v-slot:selected-item="scope">
        <q-chip
          v-if="ringGroupsArray"
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
            v-on:click="onModifyRingGroups">
      <pencil-o-icon></pencil-o-icon> Modify Ring Groups
    </b-link>
  </b-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import talk2Api from '../../../../plugins/api/api'
import PencilOIcon from 'components/icons/pencil-o-icon'
export default {
  name: 'contact-ring-groups',
  components: { PencilOIcon },
  computed: {
    ...mapGetters('contacts', ['contact', 'ringGroups', 'contactRingGroups']),
    appliedRingGroups () {
      if (this.contactRingGroups.length > 0) {
        return this.ringGroups.filter(ringGroup => this.contactRingGroups.includes(ringGroup.id))
      }
      return []
    }
  },
  data () {
    return {
      is_edit: false,
      ringGroupsArray: [],
      options: [],
      stringOptions: []
    }
  },
  methods: {
    ...mapActions('contacts', ['setRingGroups', 'setContactRingGroups']),
    getContactRingGroups () {
      return talk2Api.V1.contact.getRingGroups(this.contact.id).then(response => {
        this.setContactRingGroups(response.data)
        this.ringGroupsArray = response.data
      })
    },
    onModifyRingGroups () {
      this.is_edit = true
      this.$nextTick(function () {
        this.$refs.contactRingGroupsSelect.focus()
      })
    },
    onSelectBlur () {
      this.is_edit = false
      this.submit()
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
    submit () {
      talk2Api.V1.contact.storeRingGroups(this.contact.id, { ring_group_ids: this.ringGroupsArray })
        .then(response => {
          this.setContactRingGroups(this.ringGroupsArray)
        }).catch(err => {
          console.log(err)
          this.$root.handleErrors(err.response)
        })
    }
  },
  watch: {
    'contact.id': function () {
      this.getContactRingGroups()
    }
  },
  mounted () {
    talk2Api.V1.ringGroups.get()
      .then(response => {
        this.setRingGroups(response.data)
        this.stringOptions = response.data
        this.options = this.stringOptions
      })

    this.getContactRingGroups()
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
