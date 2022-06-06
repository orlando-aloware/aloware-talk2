<template>
  <div style="position:relative" v-bind:class="{'open':openSuggestion}">
    <input class="form-control" type="text" v-model="selection"
           @keydown.enter = 'enter'
           @keydown.down = 'down'
           @keydown.up = 'up'
           @input = 'change'
    />
    <ul class="dropdown-menu" style="width:100%">
      <li v-for="(suggestion, index) in matches"
          v-bind:class="{'active': isActive(index)}"
          :key="index"
          @click="suggestionClick(index)"
      >
        <a href="#">{{ suggestion }}</a>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'auto-complete',
  props: {
    suggestions: {
      type: Array,
      required: true
    },
    selection: {
      type: String,
      required: true,
      twoWay: true
    },
    optionValue: {
      type: String,
      required: false
    }
  },
  data () {
    return {
      open: false,
      current: 0
    }
  },

  computed: {

    // Filtering the suggestion based on the input
    matches () {
      return this.suggestions
      // return this.suggestions.filter((str) => {
      //   console.log(str)
      //   return str.indexOf(this.selection) >= 0
      // })
    },

    // The flag
    openSuggestion () {
      return this.selection !== '' &&
        this.matches.length !== 0 &&
        this.open === true
    }
  },
  methods: {
    // When enter pressed on the input
    enter () {
      this.selection = this.matches[this.current]
      this.open = false
    },

    // When up pressed while suggestions are open
    up () {
      if (this.current > 0) { this.current-- }
    },

    // When up pressed while suggestions are open
    down () {
      if (this.current < this.suggestions.length - 1) { this.current++ }
    },

    // For highlighting element
    isActive (index) {
      return index === this.current
    },

    // When the user changes input
    change () {
      if (!this.open) {
        this.open = true
        this.current = 0
      }
    },

    // When one of the suggestion is clicked
    suggestionClick (index) {
      this.selection = this.matches[index]
      this.open = false
    }
  },
  mounted () {
    // console.log(this.selection, this.optionValue)
  }
}
</script>

<style scoped>

</style>
