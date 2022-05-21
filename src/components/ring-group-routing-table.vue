<template>
  <div class="mt-4">
    <div class="text-center mb-4">
      <arrow-down-icon></arrow-down-icon>
    </div>
    <q-card flat bordered class="my-card">
      <q-card-section>
        <div class="text-h6 text-center">Layer {{ layer.layer }}</div>
      </q-card-section>

      <q-card-section class="text-center">
        <q-table
          hide-pagination
          class="ring-group-snapshot-table"
          separator="none"
          row-key="user"
          :data="rows"
          :columns="columns"
        >

          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                :class="[col.name === 'user' ? 'cursor-pointer' : '']"
                @click="onExpand(col.name, props)"
              >
                <div class="d-flex justify-content-between">
                  <span>
                    <b-badge v-if="col.name === 'status'"
                             class="fs-12"
                             :variant="col.value === 'Available' ? 'success' : 'danger'">
                      {{ col.value }}
                    </b-badge>
                    <span v-else>{{ col.value }}</span>
                  </span>
                  <span v-if="col.name === 'user'">
                    <i class="fa" :class="[props.expand ? 'fa-chevron-down' : 'fa-chevron-right']"></i>
                  </span>
                </div>

              </q-td>
            </q-tr>
            <q-tr v-show="props.expand" :props="props">
              <q-td></q-td>
              <q-td></q-td>
              <q-td colspan="100%" class="text-left">
                <ul class="list-unstyled">
                  <li v-for="result in props.row.results"
                      :key="result.key">
                    <i v-if="result.value"
                       class="material-icons text-dark-greenish">
                      check
                    </i>
                    <i v-else
                       class="material-icons text-danger">
                      close
                    </i>
                    {{ result.label }}
                  </li>
                </ul>
              </q-td>
            </q-tr>
          </template>

          <template v-slot:no-data="{ icon, message }">
            <div class="full-width row flex-center text-accent q-gutter-sm">
              <span>{{ message }}</span>
            </div>
          </template>

        </q-table>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import * as RingGroupDialMode from 'src/constants/ring-group-dial-modes'
import * as AgentStatusLabels from 'src/constants/agent-status-labels'
import ArrowDownIcon from 'components/icons/arrow-down-icon'

export default {
  name: 'ring-group-routing-table',
  components: { ArrowDownIcon },
  props: {
    columns: {
      type: Array,
      required: true
    },
    layer: {
      type: Object,
      required: true
    },
    ringGroup: {
      type: Object,
      required: true
    }
  },
  computed: {
    rows () {
      const rows = []
      this.layer.user_results.forEach((value) => {
        rows.push({
          order: value.agent_is_eligible_to_take_call ? (this.ringGroup.dial_mode === RingGroupDialMode.DIAL_MODE_SIMUL ? 1 : this.layer.order++) : '-',
          status: value.model.is_destination ? 'Available' : AgentStatusLabels.LABELS.find(label => label.value === value.model.agent_status).label,
          user: value.model.full_name,
          take_calls: value.agent_is_eligible_to_take_call ? 'Yes' : 'No',
          results: value.results
        })
      })
      return rows
    }
  },
  data () {
    return {
    }
  },
  methods: {
    onExpand (key, props) {
      if (key !== 'user') {
        return
      }
      props.expand = !props.expand
    }
  }
}
</script>
