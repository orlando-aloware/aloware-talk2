<template>
<div class="header flex- w-100">
  <search placeholder=""
          :border="false"
          v-if="isSearch">
  </search>
  <div class="calls-header__label w-100 d-flex justify-content-between pl-0 pr-2"
       v-else>
    <q-select class="m-0"
              ref="select"
              borderless
              emit-value
              map-options
              v-model="filterLeft"
              :options="optionsLeft"
              :append="[{icon: 'ion-ios-arrow-down'}]">
    </q-select>
    <q-select class="m-0"
              borderless
              emit-value
              map-options
              v-model="filterRight"
              :options="optionsRight"
              :append="[{icon: 'ion-ios-arrow-down'}]">
    </q-select>
  </div>
</div>
</template>

<script>
import Search from 'components/search'

export default {
  name: 'calls-header.vue',
  components: { Search },
  props: {
    isSearch: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      optionsLeft: [
        {
          label: 'Everything',
          value: 'everything'
        },
        {
          label: 'Test',
          value: 'test'
        }
      ],
      optionsRight: [
        {
          label: 'Newest',
          value: 'Newest'
        },
        {
          label: 'Oldest',
          value: 'oldest'
        }
      ],
      filterLeft: 'everything',
      filterRight: 'oldest'
    }
  },
  mounted () {
    console.log('ref: ', this.$refs.select)
    // this.icon.input.dropdown = 'arrow_downward'
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
</style>
