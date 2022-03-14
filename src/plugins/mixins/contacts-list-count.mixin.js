import qs from 'qs'

export default {
  methods: {
    getListDataCount (data) {
      return this.$axios.get(`api/v2/contacts/count`, { params: this.buildQueryString(JSON.parse(data.filters)), paramsSerializer: qs.stringify })
    },
    buildQueryString (filters) {
      console.log(filters)
      const query = {}

      const keys = Object.keys(filters)
      if (keys.length > 0) {
        query.filter_groups = []
        keys.forEach(function (value, i) {
          if (!['sort', 'order', 'search', 'relations'].includes(value)) {
            query.filter_groups.push(filters[value])
          }
        })
      }

      return query
    }
  }
}
