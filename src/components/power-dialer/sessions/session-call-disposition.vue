<template>
  <div class="t-menu">
    <div class="t-menu__header t-dense d-flex align-items-center">
      <div class="header__header__title font-weight-bold text-grey-8 pl-3 flex-grow-1">
        CALL DISPOSITION
      </div>
    </div>
    <div class="d-flex t-menu__content px-3 pb-2">
      <q-chip
        v-for="chip in callDisposition"
        :key="chip.name"
        :color="chip.color"
        :outline="chip.outlined"
        square
        :class="`p-0 mx-2 ${chip.outlined ? '' : 'text-white'}`">
        {{ chip.label }}
      </q-chip>
      <q-chip square outline color="grey" class="p-0">...</q-chip>
    </div>

    <div class="t-menu__header t-dense d-flex align-items-center no-border pt-0">
      <div class="header__header__title font-weight-bold text-grey-8 pl-3 flex-grow-1">
        CONTACT DISPOSITION
      </div>
    </div>
    <div class="d-flex t-menu__content px-3 pb-2">
      <q-chip
        v-for="chip in contactDisposition"
        :key="chip.name"
        :color="`${chip.outlined ? 'grey' : 'primary'}`"
        :outline="chip.outlined"
        square
        :class="`p-0 mx-2 ${chip.outlined ? '' : 'text-white'}`">
        {{ chip.label }}
      </q-chip>
      <q-chip square outline color="primary" class="p-0">...</q-chip>
    </div>

    <div class="t-menu__header t-dense d-flex align-items-center no-border pt-0">
      <div class="header__header__title font-weight-bold text-grey-8 pl-3 flex-grow-1">
        VOICEMAIL
      </div>
    </div>
    <div class="d-flex t-menu__content px-3 pb-0">
      <q-chip
        v-for="chip in voicemail"
        :key="chip.name"
        color="grey-7"
        outline
        square
        :class="`p-0 mx-2 ${chip.outlined ? '' : 'text-blue'}`">
        {{ chip.label }}
      </q-chip>
      <q-chip square outline color="grey-7" class="p-0">...</q-chip>
    </div>

  </div>
</template>

<script>
export default {
  name: 'SessionCallDisposition',
  data () {
    return {
      voicemail: [
        { label: 'Default Voicemail' },
        { label: 'Follw Up VM' }
      ],
      contactDisposition: [
        {
          name: 'interested',
          label: 'Interested',
          outlined: false,
          color: ''
        },
        {
          name: 'waiting',
          label: 'Waiting',
          outlined: true,
          color: ''
        },
        {
          name: 'no-answer',
          label: 'No Answer',
          outlined: true,
          color: ''
        },
        {
          name: 'need-research',
          label: 'Need Research',
          outlined: true,
          color: ''
        }
      ],
      callDisposition: [
        {
          name: 'busy',
          label: 'Busy',
          outlined: true,
          color: 'warning'
        },
        {
          name: 'connected',
          label: 'Connected',
          outlined: true,
          color: 'success'
        },
        {
          name: 'inbound-call-to-uk',
          label: 'Inbound Call to UK',
          outlined: true,
          color: 'violet'
        },
        {
          name: 'dropped',
          label: 'Dropped',
          outlined: false,
          color: 'primary'
        }
      ]
    }
  }
}
</script>
