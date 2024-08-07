<template>
  <div>
    <q-select ref="hubspotListSelector"
              options-selected-class="text-primary"
              class="q-basic-selector"
              color="primary"
              option-value="id"
              option-label="name"
              input-debounce="0"
              style="word-break: break-all;"
              use-input
              emit-value
              map-options
              outlined
              dense
              v-model="selectedId"
              :options="options"
              :placeholder="placeholder"
              :multiple="multiple"
              :disable="disable"
              :class="[ prepend ? 'with-prepend' : '', genericStyling ? 'generic-selector' : '', highlighted ? highlightedClass : '']"
              :use-chips="useChips"
              :clearable="clearable"
              :popup-content-style="`width: ${selectWidth}px; word-break: break-all;`"
              :loading="isLoading || isScrolling"
              @popup-show="onShowMenu"
              @focus="onFocus"
              @blur="onBlur"
              @input="onInput"
              @filter="filterFn"
              @virtual-scroll="onScroll">
      <template v-slot:prepend
                v-if="prepend">
        <span class="text-size-xs text-grey-80">{{ prepend }}</span>
      </template>

      <template v-slot:no-option>
        <q-item>
          <q-item-section class="no-results text-grey">
            No results
          </q-item-section>
        </q-item>
      </template>

      <template v-slot:option="scope">
        <q-item v-if="!scope.opt.group"
                v-bind="scope.itemProps"
                v-on="scope.itemEvents">
          <q-item-section>
            <q-item-label>
              <q-item-label v-html="scope.opt.name" ></q-item-label>
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="scope.opt.group"
                v-bind="scope.itemProps"
                v-on="scope.itemEvents">
          <q-item-label header
                        class="text-size-xs">
            {{ scope.opt.group }}
          </q-item-label>
        </q-item>
      </template>

      <template v-slot:selected-item="scope"
                v-if="useChips">
        <q-chip dense
                :tabindex="scope.tabindex"
                color="white"
                class="tag-selected-chip"
                text-color="secondary">
          <i class="fa fa-circle position-absolute"
             :style="`color: ${scope.opt.color}; font-size: 50%; left: 4px; top: 40%; margin-right: 10px;`"></i>
          <span class="ml-3 mr-3 pr-1 pl-1">{{ scope.opt.name }}</span>
          <div role="button"
               class="custom__remove d-flex align-items-center position-absolute r-0"
               @click="scope.removeAtIndex(scope.index)">
            <remove-tag-icon class="ml-1 remove-tag-icon"/>
          </div>
        </q-chip>
      </template>
    </q-select>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { selectorMixin, integrationMixin } from 'src/plugins/mixins'
import RemoveTagIcon from 'components/icons/contact-activity/remove-tag-icon'
import talk2Api from 'src/plugins/api/api'
import { debounce } from 'lodash'

export default {
  name: 'integration-list-selector',

  mixins: [selectorMixin, integrationMixin],

  components: {
    RemoveTagIcon
  },

  props: {
    integration: {
      type: String,
      required: true
    },

    value: {
      required: false
    },

    exclude: {
      required: false,
      default: null
    },

    blockBroadcast: {
      type: Boolean,
      required: false,
      default: false
    },

    multiple: {
      type: Boolean,
      default: false,
      required: false
    },

    clearable: {
      type: Boolean,
      default: false,
      required: false
    },

    useChips: {
      type: Boolean,
      default: false,
      required: false
    },

    disable: {
      type: Boolean,
      default: false,
      required: false
    },

    prepend: {
      type: String,
      required: false
    },

    genericStyling: {
      type: Boolean,
      default: true
    },

    highlighted: {
      type: Boolean,
      default: false
    },

    highlightedClass: {
      type: String,
      default: 'q-field--highlighted'
    }
  },

  computed: {
    ...mapState('cache', [
      'currentCompany'
    ]),
    placeholder () {
      switch (true) {
        case this.multiple && this.selectedId && this.selectedId.length < 1:
          return 'Select lists'
        case !this.multiple && !this.selectedId:
          return 'Select list'
        case this.multiple && this.selectedId && this.selectedId.length > 0:
        case !this.multiple && this.selectedId:
        default:
          return ''
      }
    },
    sorted () {
      if (this.lists.length > 0) {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        return this.lists.sort((a, b) => {
          const textA = a.name.toUpperCase()
          const textB = b.name.toUpperCase()
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
        })
      }

      return []
    }
  },

  data () {
    return {
      selectedId: this.value,
      isLoading: false,
      isScrolling: false,
      options: [],
      total: 0,
      reference: 'hubspotListSelector',
      fullOptionsProperty: 'sorted',
      lists: [],
      disableAddView: false,
      searchQuery: '',
      offset: 0,
      hasMore: true,
      limit: 20
    }
  },

  methods: {
    isHubSpotIntegration () {
      return this.integration?.toLowerCase() === 'hubspot'
    },

    fetchOptions (search = null, offset = 0) {
      if (this.searchQuery !== search) {
        offset = 0
      }

      this.offset = offset

      if (!offset) {
        // do not block the UI if we are loading more
        this.isLoading = true
      }

      return talk2Api.V1.integrations.hubspot.getList({
        params: {
          search,
          offset
        }
      }).then(response => {
        const result = response.data
        if (offset === 0) {
          this.options = result.lists
        } else {
          this.options.push(...result.lists)
        }
        this.hasMore = result.hasMore
        this.total = result.total
        this.isLoading = false
      }).catch((err) => {
        this.isLoading = false
        this.$handleErrors(err.response)
        console.log(err)
      })
    },

    filterFn (val, update) {
      if (this.isHubSpotIntegration()) {
        if (val === this.searchQuery) {
          update()

          return
        }

        this.searchQuery = val

        update(() => {
          this.fetchOptions(val, 0)
        })
      } else {
        if (val === '') {
          update(() => {
            this.options = this.sorted
          })

          return
        }

        update(() => {
          const needle = val.toLowerCase()
          this.options = this.sorted.filter((item) => item.name && item.name.toLowerCase().indexOf(needle) > -1)
        })
      }
    },

    onScroll ({ to, ref }) {
      if (!this.isHubSpotIntegration()) {
        return
      }

      const lastIndex = this.options.length - 1
      if (this.isScrolling !== true && this.hasMore && to === lastIndex) {
        this.isScrolling = true

        this.fetchOptions(this.searchQuery, this.offset + this.limit)
          .then(() => {
            this.$nextTick(() => {
              ref.refresh()
              this.isScrolling = false
            })
          })
          .catch(() => {
            this.isScrolling = false
          })
      }
    },

    getListsOfEnabledIntegration: debounce(function () {
      this.lists = []

      switch (this.integration?.toLowerCase()) {
        case 'hubspot':
          return this.fetchOptions()

        case 'zoho':
          return this.getZohoViews()

        case 'pipedrive':
          return this.getPipedriveFilters()
      }
    }, 500),

    getZohoViews () {
      this.isLoading = true

      talk2Api.V1.integrations.zoho.getViews().then(response => {
        this.isLoading = false
        this.lists.push(...response.data)
      }).catch((err) => {
        this.isLoading = false
        this.$handleErrors(err.response)
        console.log(err)
      })
    },

    getPipedriveFilters () {
      this.isLoading = true

      talk2Api.V1.integrations.pipedrive.getFilters().then(response => {
        this.isLoading = false
        this.lists.push(...response.data)
      }).catch((err) => {
        this.isLoading = false
        this.$handleErrors(err.response)
        console.log(err)
      })
    }
  },

  mounted () {
    this.getListsOfEnabledIntegration()
  },

  watch: {
    value () {
      this.selectedId = this.value
    },

    selectedId: function (value) {
      let payload = {
        list: value,
        integration: this.integration
      }

      // When the payload is an array, instead of a single value
      if (typeof value !== 'object') {
        payload.list = this.options.filter(option => option.id === value)[0]
      }

      this.$emit('change', payload)
      this.showInputPlaceholder()
    },

    integration (val) {
      this.getListsOfEnabledIntegration()
    }
  }
}
</script>
