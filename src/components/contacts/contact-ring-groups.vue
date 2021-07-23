<template>
  <b-card class="border-0 contact-ring-groups-wrapper">
    <h4>Contact Ring Groups</h4>
    <div v-if="!isEdit"
         class="mt-1">
      <b-badge variant="primary"
               class="badge-tag badge-tag-primary ellipsis"
               v-for="ringGroup in appliedRingGroups"
               :key="ringGroup.id">
        <q-tooltip anchor="top middle"
                   self="center middle"
                   :offset="[20, 20]">
          {{ ringGroup.name }}
        </q-tooltip>
        {{ ringGroup.name }}
      </b-badge>
    </div>
    <vue-multiselect v-show="isEdit"
                     class="chip__clear-blue border-blue shrink-options options__no-border options__relative mt-2"
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
            @click="onModifyRingGroups">
      <pencil-o-icon></pencil-o-icon> Modify Ring Groups
    </b-link>
  </b-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import PencilOIcon from 'src/components/icons/pencil-o-icon'
import VueMultiselect from 'vue-multiselect'
import { aclMixin } from 'src/plugins/mixins'
import _ from 'lodash'

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
      selectedRingGroups: []
    }
  },
  methods: {
    ...mapActions('contacts', ['setRingGroups', 'setContactRingGroups']),
    getContactRingGroups () {
      return talk2Api.V1.contact.getRingGroups(this.contact.id).then(response => {
        this.setContactRingGroups(response.data)
        this.ringGroupsArray = response.data
        this.selectedRingGroups = this.options.filter(ringGroup => this.ringGroupsArray.includes(ringGroup.id))
      })
    },
    getRingGroups () {
      return talk2Api.V1.ringGroups.get()
        .then(response => {
          this.setRingGroups(response.data)
          this.options = response.data
          this.getContactRingGroups()
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
      if (!_.isEmpty(this.contact)) {
        this.getContactRingGroups()
      }
    }
  },
  mounted () {
    if (!_.isEmpty(this.contact)) {
      this.getRingGroups()
    }
  }
}
</script>
