<template>
  <div class="t-menu">
    <div class="t-menu__header no-border d-flex align-items-center pr-3">
      <div class="header__header__title font-weight-bold pl-3 text-13 flex-grow-1">
        SESSION
      </div>
      <b-dropdown size="xs" variant="link" toggle-class="text-decoration-none" no-caret>
        <template class="p-0 m-0 text-black" style="color:black; font-size:10px;" #button-content>
          <div class="text-caption text-black">
            Power Sort
            <i class="fa fa-chevron-down fa-xs text-black"></i>
          </div>
        </template>
        <b-dropdown-item
          @click="{}"
          class="text-capitalize text-body2" href="#">Item 1</b-dropdown-item>
        <b-dropdown-item class="text-capitalize text-body2" href="#">Item 2</b-dropdown-item>
      </b-dropdown>

      <SettingIcon
        width="15px"
        height="15px"
        class="mr-2" />

    </div>
    <div class="t-menu__header d-flex align-items-center">
      <div class="header__header__title font-weight-bold pl-3 text-13 flex-grow-1">
        STATS
      </div>
    </div>
    <div class="d-flex t-menu__content flex-column pb-0 pl-2">
      <q-card class="py-0 my-0 pl-1" flat>
        <div class="row">
          <div
            class="col col-4 p-0 px-1 pb-3"
            v-for="stat in stats"
            :key="stat.name">
            <q-card-section
              class="p-0">
              <div class="t-value text-subtitle1 text-weight-medium d-flex">
                {{ stat.values.primary }}
                <div class="text-caption pt-1 pl-1 text-grey">{{stat.values.secondary}}</div>
              </div>
              <div class="t-label text-caption text-grey-90">{{ stat.name }}</div>
            </q-card-section>
            </div>
        </div>
      </q-card>
    </div>
  </div>
</template>

<script>

import SettingIcon from 'components/icons/setting-o-icon'

export default {
  name: 'SessionStats',
  components: {
    SettingIcon
  },
  data () {
    return {
      stats: [
        { name: 'Duration', values: { primary: '36m', secondary: '' } },
        { name: 'Contacts', values: { primary: '33', secondary: '/324' } },
        { name: 'Connected Call Disp.', values: { primary: '23', secondary: '(71%)' } },
        { name: 'Interested Call Disp.', values: { primary: '2', secondary: '(8%)' } },
        { name: 'Closed Contact Disp.', values: { primary: '1', secondary: '(4%)' } }
      ]
    }
  }
}
</script>
