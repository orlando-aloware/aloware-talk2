<template>
  <div class="d-flex flex-row align-items-center" v-if="pipedriveEnabled">
    <el-select
      v-model="filterId"
      class="d-flex flex-grow-1"
      :placeholder="placeholder"
      :multiple="multiple"
      :multiple-limit="multiple ? multipleLimit : 0"
      :loading="loadingPipedriveFilters"
      :disabled="!loadingPipedriveFilters && !getPipedriveFilters.length"
      filterable
      clearable
      default-first-option
      collapse-tags
    >
      <el-option
        v-for="list in filtersAlphabeticalOrder"
        :key="list.id"
        :label="list.name"
        :value="list.id"
      >
      </el-option>
    </el-select>
    <el-button
      type="primary"
      icon="fa fa-refresh"
      size="mini"
      class="ml-2 w-30"
      :disabled="loadingPipedriveFilters"
      :loading="loadingPipedriveFilters"
      circle
      @click="handleFetchPipedriveFilters"
    >
    </el-button>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { handleVuexApiCall } from '../utils/integration-helpers'

export default {
  props: {
    value: {
      required: false
    },

    exclude: {
      required: false
    },

    multiple: {
      type: Boolean,
      required: false,
      default: false
    },

    multipleLimit: {
      type: Number,
      required: false,
      default: 0
    }
  },

  data: () => ({
    filterId: null,
    loadingPipedriveFilters: false,
    pipedriveFilters: []
  }),

  computed: {
    ...mapGetters(['cache/getCurrentCompany', 'getPipedriveFilters']),

    pipedriveEnabled () {
      return (
        this['cache/getCurrentCompany'] &&
        this['cache/getCurrentCompany'].pipedrive_integration_enabled
      )
    },

    placeholder () {
      if (this.loadingPipedriveFilters) {
        return 'Loading ...'
      }

      return 'Pipedrive Custom Filter'
    },

    filtersAlphabeticalOrder () {
      if (this.getPipedriveFilters) {
        return this.getPipedriveFilters.slice(0).sort((a, b) => {
          let textA = a.name.toUpperCase()
          let textB = b.name.toUpperCase()
          return textA < textB ? -1 : textA > textB ? 1 : 0
        })
      }

      return []
    },

    activeFilter () {
      if (this.getPipedriveFilters && this.filterId) {
        return this.getPipedriveFilters.find(
          (pipedriveFilter) => pipedriveFilter.id === this.filterId
        )
      }

      return null
    }
  },

  async mounted () {
    if (this.pipedriveEnabled) {
      await this.handleFetchPipedriveFilters()
    }
  },

  methods: {
    ...mapActions(['fetchPipedriveFilters']),
    async handleFetchPipedriveFilters () {
      this.pipedriveFilters = []
      this.loadingPipedriveFilters = true

      await handleVuexApiCall(this.fetchPipedriveFilters)

      this.loadingPipedriveFilters = false
    }
  },

  watch: {
    value () {
      this.filterId = this.value
    },

    filterId (val) {
      if (this.value !== undefined && this.filterId !== this.value) {
        this.$emit('selectedFilter', this.activeFilter)
        this.$emit('change', val)
      }
    }
  }
}
</script>
