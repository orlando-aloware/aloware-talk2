<template>
  <div class="d-flex flex-row align-items-center" v-if="zohoEnabled">
    <el-select
      v-model="viewId"
      class="d-flex flex-grow-1"
      :placeholder="placeholder"
      :multiple="multiple"
      :multiple-limit="multiple ? multipleLimit : 0"
      :loading="loadingZohoViews"
      :disabled="!loadingZohoViews && !zohoViews.length"
      filterable
      clearable
      default-first-option
      collapse-tags
    >
      <el-option
        v-for="list in viewsAlphabeticalOrder"
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
      :disabled="loadingZohoViews"
      :loading="loadingZohoViews"
      circle
      @click="getZohoViews"
    >
    </el-button>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import axios from 'axios'

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

  data () {
    return {
      viewId: this.value,
      loadingZohoViews: false,
      zohoViews: []
    }
  },

  computed: {
    ...mapState({
      currentCompany: (state) => state.cache.current_company
    }),

    zohoEnabled () {
      if (
        this.currentCompany &&
        this.currentCompany.zoho_integration_enabled
      ) {
        return true
      }

      return false
    },

    placeholder () {
      if (this.loadingZohoViews) {
        return 'Loading ...'
      }

      return 'Zoho Custom Views'
    },

    viewsAlphabeticalOrder () {
      if (this.zohoViews) {
        return this.zohoViews.slice(0).sort((a, b) => {
          let textA = a.name.toUpperCase()
          let textB = b.name.toUpperCase()
          return textA < textB ? -1 : textA > textB ? 1 : 0
        })
      }

      return []
    },

    activeView () {
      if (this.zohoViews && this.viewId) {
        return this.zohoViews.find(
          (zohoView) => zohoView.id === this.viewId
        )
      }

      return null
    }
  },

  mounted () {
    if (this.zohoEnabled) {
      this.getZohoViews()
    }
  },

  methods: {
    getZohoViews () {
      this.zohoViews = []
      this.loadingZohoViews = true
      axios
        .get('/api/v1/integration/zoho/views')
        .then((res) => {
          this.loadingZohoViews = false
          this.zohoViews = res.data
        })
        .catch((err) => {
          this.loadingZohoViews = false
          this.$root.handleErrors(err.response)
          console.log(err)
        })
    }
  },

  watch: {
    value () {
      this.viewId = this.value
    },

    viewId (val) {
      if (this.value !== undefined && this.viewId !== this.value) {
        this.$emit('selectedView', this.activeView)
        this.$emit('change', val)
      }
    }
  }
}
</script>
