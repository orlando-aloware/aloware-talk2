<template>
  <div class="t-menu-2 no-border">
    <div class="d-flex align-items-center pt-3">
      <div class="font-weight-bold pl-3 flex-grow-1">
        <q-chip class="p-0">
          <div class="text-lowercase text-capitalize">
            Will call in <span class="text-caption text-weight-bold text-grey-7 text-lowercase">99s</span>
          </div>
        </q-chip>
      </div>
      <q-btn no-wrap outline no-caps size="sm" color="teal" class="mx-1" unelevated>
        <q-icon size="15px" name="phone" class="ml-2" />
        <div class="px-2 text-body2">Unhold</div>
      </q-btn>
      <q-btn no-wrap no-caps size="sm" color="red-9" class="mx-1" unelevated>
        <q-icon size="15px" name="phone" class="ml-2" />
        <div class="px-2 text-body2">Next</div>
      </q-btn>
      <q-btn outline no-wrap no-caps size="sm" color="grey-9" class="mx-1" unelevated>
        <div class="px-2 text-subtitle1">...</div>
      </q-btn>
    </div>
    <div class="t-menu__header no-border d-flex align-items-center py-3">
      <div class="header__header__title font-weight-bold pl-3 flex-grow-1">
        <div class="text-h5 text-capitalize text-weight-bold pb-1">
          {{ stats.first_name }} {{ stats.last_name }}
          <span class="text-subtitle1">{{ stats.phone_number }}</span>
        </div>
        <div class="text-h6 text-subtitle1 text-capitalize">
          {{ stats.position }}
          <span class="text-subtitle2 text-grey"> | {{ stats.company }}</span>
        </div>
        <div class="text-h6 text-subtitle1 text-capitalize py-2">
          {{ stats.address }}
        </div>
        <div class="text-h6 text-h6 text-capitalize text-weight-normal">
          {{ stats.group }}
          <span class="text-subtitle2 text-grey"></span>
        </div>
        {{ stats.line }}
      </div>
      <!-- RIGHT SIDE -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'SessionCallStatus',
  data () {
    return {
      stats: {
        first_name: 'Jimmy',
        last_name: 'Raynor',
        phone_number: '(888) 217 1436',
        position: 'Sales Manager',
        company: 'AI Learning',
        address: 'Albany, New York - 6:15 PM',
        group: 'Google Map List',
        line: 'Bently Personal'
      }
    }
  }
}
</script>
