<template>
  <div class="position-absolute search-icon search-wrapper">
    <compact-btn borderless
                 customClass="fs-14 _500 position-relative primary not-focusable filter-toggle-button"
                 variant="outlined-light"
                 :disabled="isLoading"
                 @clicked="$emit('opened')">
      <search-icon :color="searchIconColor"></search-icon>
    </compact-btn>
  </div>
</template>

<script>
import CompactBtn from 'components/compact-btn'
import SearchIcon from 'components/icons/search-icon'
export default {
  name: 'inbox-searcher',

  components: { SearchIcon, CompactBtn },

  props: {
    isLoading: {
      type: Boolean,
      default: false
    },
    searchIconColor: {
      type: String,
      default: '#62666E'
    }
  }
}
</script>
