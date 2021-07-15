<template>
  <b-card class="mt-2 mb-2 border-0">
    <h6>Contact Ring Groups</h6>
    <div v-if="!isEdit">
      <b-badge variant="primary"
               class="badge-tag badge-tag-primary ellipsis"
               v-for="ringGroup in appliedRingGroups"
               v-b-tooltip="ringGroup.name"
               :key="ringGroup.id">{{ ringGroup.name }}</b-badge>
    </div>
    <vue-multiselect v-show="isEdit"
                     class="chip__clear-blue border-blue shrink-options options__no-border options__relative"
                     track-by="id"
                     label="name"
                     ref="ringGroupSelect"
                     placeholder="Select ring group"
                     openDirection="bottom"
                     :closeOnSelect="false"
                     :showLabels="false"
                     :multiple="true"
                     :options="options"
                     v-model="selectedRingGroups"
                     @close="onSelectBlur">
    </vue-multiselect>
    <b-link v-if="!isEdit && hasRole('Company Admin') || (hasRole('Company Agent') && hasPermissionTo('modify contact ring groups'))"
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
import VueMultiselect from 'vue-multiselect'
import { aclMixin } from 'src/plugins/mixins'
export default {
  name: 'contact-ring-groups',
  mixins: [aclMixin],
  components: { PencilOIcon, VueMultiselect },
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
      isEdit: false,
      ringGroupsArray: [],
      options: [],
      stringOptions: [],
      selectedRingGroups: []
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
      this.isEdit = true
      this.$nextTick(function () {
        this.$refs.ringGroupSelect.$el.focus()
      })
    },
    onSelectBlur () {
      this.isEdit = false
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
      let ringGroupIds = this.selectedRingGroups.map(ringGroup => ringGroup.id)
      talk2Api.V1.contact.storeRingGroups(this.contact.id, { ring_group_ids: ringGroupIds })
        .then(response => {
          this.setContactRingGroups(ringGroupIds)
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
