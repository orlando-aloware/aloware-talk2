<template>
  <div class="header w-100"
       :class="{'border-bottom-transparent': isSearch}"
       data-testid="calls-header-wrapper">
    <div class="calls-header__label w-100 d-flex justify-content-between pl-0 pr-2">
      <slot name="customLeftContent" v-if="hasCustomLeftContent"></slot>
      <q-select class="m-0"
                ref="select"
                borderless
                emit-value
                map-options
                data-testid="calls-header-select"
                v-model="filterLeft"
                v-else
                :disable="true"
                :options="filterOptions"
                :append="[{icon: 'ion-ios-arrow-down'}]">
        <template v-slot:option="scope">
          <q-item v-if="!scope.opt.group && !scope.opt.first"
                  v-bind="scope.itemProps"
                  data-testid="calls-header-select-item"
                  v-on="scope.itemEvents">
            <q-item-section :class="[scope.opt.value !== 'everything' ? 'pl-2' : '']">
              <q-item-label v-html="scope.opt.label"></q-item-label>
            </q-item-section>
          </q-item>
          <q-item class="px-0 opacity-1"
                  v-if="scope.opt.group"
                  v-bind="scope.itemProps"
                  v-on="scope.itemEvents">
            <q-item-label class="text-grey-100 _600 px-0"
                          header>
              {{ scope.opt.group }}
            </q-item-label>
          </q-item>
          <q-item class="px-0 opacity-1"
                  v-if="scope.opt.first"
                  v-bind="scope.itemProps"
                  v-on="scope.itemEvents">
            <q-item-label class="_600 px-0"
                          header>
              {{ scope.opt.first }}
            </q-item-label>
          </q-item>
        </template>
      </q-select>
      <q-select class="m-0"
                borderless
                emit-value
                map-options
                v-model="filterRight"
                :options="optionsRight"
                :append="[{icon: 'ion-ios-arrow-down'}]"
                data-testid="calls-header-select-sort"
                @input="sort">
      </q-select>
    </div>
  </div>
</template>

<script>
export default {
  name: 'calls-header',

  props: {
    isSearch: {
      type: Boolean,
      default: false
    },
    searchPlaceholder: {
      type: String,
      default: ''
    },
    commCampaigns: {
      required: false
    },
    commRingGroups: {
      required: false
    },
    openCount: {
      required: false,
      default: 0
    },
    pendingCount: {
      required: false,
      default: 0
    },
    hasCustomLeftContent: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      optionsLeft: [
        {
          first: 'View filter',
          disable: true
        },
        {
          label: 'Everything',
          value: 'everything'
        }
      ],
      optionsRight: [
        {
          label: 'Oldest',
          value: 'oldest',
          disable: false
        },
        {
          label: 'Newest',
          value: 'newest',
          disable: false
        }
      ],
      filterLeft: 'everything',
      filterRight: 'newest'
    }
  },

  computed: {
    filterOptions () {
      const options = this.optionsLeft
      if (this.commCampaigns.length > 0) {
        options.push({
          group: 'Lines',
          disable: true
        })
        const campaign = { data: null }
        for (campaign.data of this.commCampaigns) {
          options.push({
            label: campaign.data.name,
            value: campaign.data.id
          })
        }
      }
      if (this.commRingGroups.length > 0) {
        options.push({
          group: 'Ring Groups',
          disable: true
        })
        const campaign = { data: null }
        for (campaign.data of this.commRingGroups) {
          options.push({
            label: campaign.data.name,
            value: campaign.data.id
          })
        }
      }
      return options
    }
  },

  methods: {
    search (value) {
      this.$emit('search', value)
    },
    onFocus (value) {
      this.$emit('focus', value)
    },
    onBlur (value) {
      this.$emit('blur', value)
    },
    sort (value) {
      this.$emit('sort', value)
    }
  }
}
</script>
