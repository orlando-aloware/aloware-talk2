<template>
  <div class="header flex- w-100">
    <search :placeholder="searchPlaceholder"
            :border="false"
            v-if="isSearch"
            @focus="onFocus"
            @blur="onBlur"
            @search="search">
    </search>
    <div class="calls-header__label w-100 d-flex justify-content-between pl-0 pr-2"
         v-else>
      <slot name="customLeftContent" v-if="hasCustomLeftContent"></slot>
      <q-select class="m-0"
                ref="select"
                borderless
                emit-value
                map-options
                v-model="filterLeft"
                v-else
                :disable="true"
                :options="filterOptions"
                :append="[{icon: 'ion-ios-arrow-down'}]">
        <template v-slot:option="scope">
          <q-item v-if="!scope.opt.group && !scope.opt.first"
                  v-bind="scope.itemProps"
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
                @input="sort">
      </q-select>
    </div>
  </div>
</template>

<script>
import Search from 'components/search'

export default {
  name: 'calls-header',

  components: { Search },

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
      let options = this.optionsLeft
      if (this.commCampaigns.length > 0) {
        options.push({
          group: 'Lines',
          disable: true
        })
        for (let campaign of this.commCampaigns) {
          options.push({
            label: campaign.name,
            value: campaign.id
          })
        }
      }
      if (this.commRingGroups.length > 0) {
        options.push({
          group: 'Ring Groups',
          disable: true
        })
        for (let campaign of this.commRingGroups) {
          options.push({
            label: campaign.name,
            value: campaign.id
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
