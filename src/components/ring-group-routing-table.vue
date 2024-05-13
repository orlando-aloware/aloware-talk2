<template>
  <div class="mt-4" data-testid="ring-group-rounting-table-wrapper">
    <div class="text-center mb-4">
      <arrow-down-icon data-testid="ring-group-rounting-table-arrow-down-icon"></arrow-down-icon>
    </div>
    <q-card flat bordered class="my-card" data-testid="ring-group-rounting-table-card">
      <q-card-section data-testid="ring-group-rounting-table-card-section">
        <div class="text-h6 text-center">Layer {{ layer.layer }}</div>
      </q-card-section>

      <q-card-section class="text-center" data-testid="ring-group-rounting-table-card-section">
        <q-table
          hide-pagination
          class="ring-group-snapshot-table"
          separator="none"
          row-key="user"
          :data="rows"
          :columns="columns"
          data-testid="ring-group-rounting-table-table"
        >

          <template v-slot:header="props">
            <q-tr :props="props" data-testid="ring-group-rounting-table-tr">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                data-testid="ring-group-rounting-table-th"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <template v-slot:body="props">
            <q-tr :props="props" data-testid="ring-group-rounting-table-tr">
              <q-td
                v-for="col in props.cols"
                data-testid="ring-group-rounting-table-td"
                :key="col.name"
                :props="props"
                :class="[col.name === 'user' ? 'cursor-pointer' : '']"
                @click="onExpand(col.name, props)"
              >
                <div class="d-flex justify-content-between">
                  <span>
                    <b-badge v-if="col.name === 'status'"
                             class="fs-12"
                             data-testid="ring-group-rounting-table-badge"
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
            <q-tr v-show="props.expand" :props="props" data-testid="ring-group-rounting-table-tr">
              <q-td data-testid="ring-group-rounting-table-td"></q-td>
              <q-td data-testid="ring-group-rounting-table-td"></q-td>
              <q-td data-testid="ring-group-rounting-table-td" colspan="100%" class="text-left">
                <ul class="list-unstyled" data-testid="ring-group-rounting-table-ul">
                  <li v-for="result in props.row.results"
                      data-testid="ring-group-rounting-table-li"
                      :key="result.key">
                    <i v-if="result.value"
                       data-testid="ring-group-rounting-table-i-check"
                       class="material-icons text-dark-greenish">
                      check
                    </i>
                    <i v-else
                       data-testid="ring-group-rounting-table-i-close"
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
