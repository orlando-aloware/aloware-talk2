<template>
  <div class="search-icon search-wrapper" data-testid="inbox-searcher-wrapper">
    <compact-btn borderless
                 customClass="fs-14 _500 position-relative primary not-focusable filter-toggle-button"
                 variant="outlined-light"
                 :disabled="isLoading"
                 data-testid="inbox-searcher-compact-btn"
                 @clicked="$emit('opened')">
      <search-icon :color="searchIconColor" data-testid="inbox-searcher-search-icon"></search-icon>
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
      type: Boolean
    },

    searchIconColor: {
      type: String,
      default: '#62666E'
    }
  }
}
</script>
