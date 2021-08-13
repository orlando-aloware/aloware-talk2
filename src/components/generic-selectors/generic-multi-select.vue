<template>
  <div>
    <div class="h4">{{ label | ucwords }}</div>
    <q-field outlined
             stack-label
             v-if="isEdit">
      <template v-slot:control>
        <span class="border border-half-rounded d-inline-flex align-items-center mr-1 mb-1 tag-items"
              v-for="item in formattedValues"
              :key="item.id">
          {{ item.name }}
        </span>
      </template>
    </q-field>
    <div>
      <b-link v-if="!isEdit && hasPermissionTo(['list tag', 'view tag'])"
              href="#"
              class="custom-link text-decoration-none btn-tag-edit"
              @click="isEdit = true">
        <pencil-o-icon/>
        <span class="mr-1">
          Modify {{ label | ucwords }}
        </span>
      </b-link>
    </div>
  </div>
</template>

<script>
import PencilOIcon from 'components/icons/pencil-o-icon'
export default {
  name: 'MultiSelect',
  components: { PencilOIcon },
  props: {
    label: {
      required: false,
      type: String,
      default: ''
    },
    values: {
      required: false,
      type: Array,
      default: () => []
    },
    options: {
      required: true,
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      isEdit: false,
      selectedValues: this.values
    }
  },
  computed: {
    formattedValues () {
      let newValues = []
      for (let item of this.selectedValues) {
        let found = this.options.find(option => option.id === item.id)
        if (found) {
          newValues.push(found)
        }
      }
      return newValues
    }
  }
}
</script>
