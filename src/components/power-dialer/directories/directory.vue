<template>
  <div class="q-pa-md q-gutter-sm">
    <q-tree
      :nodes="directory"
      node-key="label"
      no-connectors
      :expanded.sync="expanded"
      default-expand-all>
      <template v-slot:default-header="prop" class="p-0">
        <div class="row items-center">
          <slot :item="prop.node" />
        </div>
      </template>
    </q-tree>
  </div>
</template>

<script>

export default {
  name: 'DirectoryFolder',
  props: {
    directory: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      expanded: [ 'Satisfied customers (with avatar)', 'Good food (with icon)' ],

      simple: [
        {
          label: 'Satisfied customers (with avatar)',
          avatar: 'https://cdn.quasar.dev/img/boy-avatar.png',
          children: [
            {
              label: 'Good food (with icon)',
              icon: 'restaurant_menu',
              children: [
                { label: 'Quality ingredients' },
                { label: 'Good recipe' }
              ]
            },
            {
              label: 'Good service (disabled node with icon)',
              icon: 'room_service',
              disabled: true,
              children: [
                { label: 'Prompt attention' },
                { label: 'Professional waiter' }
              ]
            },
            {
              label: 'Pleasant surroundings (with icon)',
              icon: 'photo',
              children: [
                {
                  label: 'Happy atmosphere (with image)',
                  img: 'https://cdn.quasar.dev/img/logo_calendar_128px.png'
                },
                { label: 'Good table presentation' },
                { label: 'Pleasing decor' }
              ]
            }
          ]
        }
      ]
    }
  }
}
</script>
