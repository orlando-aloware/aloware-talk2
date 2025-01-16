<template>
  <div class="d-flex justify-content-around"
       :style="{width: `${width}px`}">
    <i class="fa-solid fa-star"
       :style="{ color: number <= value ? filledColor : emptyColor }"
       :key="number"
       v-for="number in max"/>

    <q-tooltip>
      {{ value }} / {{ max }}
    </q-tooltip>
  </div>
</template>

<script>
export default {
  name: 'Rate',

  props: {
    value: {
      type: Number,
      required: true
    },

    max: {
      type: Number,
      default: 5,
      validator (number) {
        return number >= 5 && number <= 10
      }
    },

    width: {
      type: Number,
      default: 150
    },

    emptyColor: {
      type: String,
      default: '#eee'
    },

    filledColor: {
      type: String,
      default: 'gold'
    }
  }
}
</script>
