import { VIEWPORTS } from 'src/constants/viewport-sizes'

export default {
  computed: {
    screenWidth () {
      return this.$q.screen.width
    }
  },

  methods: {
    getResponsiveColumns (allColumns, columnsByViewport) {
      // Find the current viewport
      const currentViewport = VIEWPORTS.find((vp) => this.screenWidth >= vp.minWidth && this.screenWidth <= vp.maxWidth)

      if (currentViewport) {
        const columnNames = columnsByViewport[currentViewport.name]
        return this.filterColumns(allColumns, columnNames)
      }

      return allColumns
    },

    filterColumns (allColumns, columnNames) {
      return allColumns.filter((column) => columnNames.includes(column.name || column.field))
    }
  }
}
